import express, { type Request } from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import * as path from "path";
import httpContext from "express-http-context";
import axios from "axios";

// Trying to keep the info about the customer objects below true but do to customer_update having to
// set things change. I should probably take in a customer ID from the frontend and add it to my debug panel
// customer based in South Carolina (no tax): cus_OpvtuwflO7Q0ae
// customer based in Washington (tax): cus_PDFSYCl9xNfGw0
const CUSTOMER = "cus_OpvtuwflO7Q0ae";
const PRICE = "price_1O9a0SGJIKv4skDIY9jaxHwp";

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SK, {
  apiVersion: "2024-04-10; custom_checkout_beta=v1",
});

// Initialize express app
const app = express();
app.use(httpContext.middleware);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use((req, res, next) => {
  const requestId = crypto.randomBytes(4).toString("hex");
  httpContext.set("requestId", requestId);
  next();
});

app.post("/checkout", async (req: Request<{}>, res) => {
  const requestId = httpContext.get("requestId");
  console.log(
    `${requestId}:${new Date().toISOString()}: starting stripe.checkout.sessions.create() from server`
  );
  const session = await stripe.checkout.sessions.create({
    automatic_tax: {
      enabled: true,
    },
    customer: CUSTOMER,
    customer_update: {
      shipping: "auto",
    },
    line_items: [
      {
        price: PRICE,
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: "http://example.com/success",
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    ui_mode: "custom",
    expand: ["customer"],
  });
  console.log(
    `${requestId}:${new Date().toISOString()}: finished stripe.checkout.sessions.create() from server`
  );

  res.json({ clientSecret: session.client_secret, session: session });
});

const requestCheckoutSession = async (
  requestId: string,
  paymentPageUrl: string
) => {
  console.log(
    `${requestId}:${new Date().toISOString()}: starting GET /v1/payment_pages/cs_test_... from server`
  );
  const result = await axios.get(paymentPageUrl, {
    params: {
      key: process.env.STRIPE_PK || "",
    },
  });
  console.log(
    `${requestId}:${new Date().toISOString()}: finished GET /v1/payment_pages/cs_test_... from server (prove we got a successful response: id=${
      result.data.id
    })`
  );
};

app.post(
  "/setAddress",
  async (
    req: Request<{
      sessionId: string;
      address: any;
      requestSessionFirst: boolean;
    }>,
    res
  ) => {
    try {
      const requestId = httpContext.get("requestId");
      const { sessionId, address, requestSessionFirst } = req.body;
      const paymentPageUrl = `https://api.stripe.com/v1/payment_pages/${sessionId}`;
      if (requestSessionFirst) {
        await requestCheckoutSession(requestId, paymentPageUrl);
      }

      console.log(
        `${requestId}:${new Date().toISOString()}: starting POST /v1/payment_pages/cs_test_... from server`
      );
      const params = new URLSearchParams();
      params.append("key", process.env.STRIPE_PK || "");
      // looks like empty string isn't allowed
      // we probably need to set present but empty somehow? Not too important for now...
      address.country && params.append("tax_region[country]", address.country);
      address.state && params.append("tax_region[state]", address.state);
      address.zip && params.append("tax_region[postal_code]", address.zip);
      address.city && params.append("tax_region[city]", address.city);
      address.line1 && params.append("tax_region[line1]", address.line1);
      // doesn't seem like line2 should be that important but checkout sends it
      address.line2 && params.append("tax_region[line2]", address.line2);
      const ppage = await axios.post(
        `https://api.stripe.com/v1/payment_pages/${sessionId}`,
        params.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      console.log(
        `${requestId}:${new Date().toISOString()}: finished POST /v1/payment_pages/cs_test_... from server`
      );

      res.json({ ppage: ppage.data });
    } catch (err) {
      console.log(`setAddress error: ${err}`);
      res.status(400);
    }
  }
);

const startServer = async () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, async () => {
    // other start-up stuff we don't want to do in tests
  });
};

// don't actually bind to a port in tests
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;

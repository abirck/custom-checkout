import express, { type Request } from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import * as path from "path";
import httpContext from "express-http-context";
import axios from "axios";

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
  // customer based in South Carolina (no tax): cus_OpvtuwflO7Q0ae
  // customer based in Washington (tax): cus_PDFSYCl9xNfGw0
  const session = await stripe.checkout.sessions.create({
    automatic_tax: {
      enabled: true,
    },
    customer: "cus_OpvtuwflO7Q0ae",
    customer_update: {
      shipping: "auto",
    },
    line_items: [
      {
        price: "price_1O9a0SGJIKv4skDIY9jaxHwp",
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

  res.json({ clientSecret: session.client_secret, session: session });
});

app.post(
  "/setAddress",
  async (req: Request<{ sessionId: string; address: any }>, res) => {
    try {
      const { sessionId, address } = req.body;
      const params = new URLSearchParams();
      params.append("key", "pk_test_FdYoaC1weOBHn0jv0KvgbHQZ");
      params.append("tax_region[country]", address.country);
      params.append("tax_region[state]", address.state);
      params.append("tax_region[postal_code]", address.zip);
      params.append("tax_region[city]", address.city);
      params.append("tax_region[line1]", address.line1);
      if (address.line2) {
        // doesn't seem like line2 should be that important but checkout sends it
        params.append("tax_region[line2]", address.line2);
      }

      const ppage = await axios.post(
        `https://api.stripe.com/v1/payment_pages/${sessionId}`,
        params.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
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

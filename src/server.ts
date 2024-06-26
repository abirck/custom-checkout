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
const CONTINENTAL_SHIPPING = "shr_1PDsR1GJIKv4skDIj1Caqv5t";
const AK_HI_SHIPPING = "shr_1PDsRkGJIKv4skDIWDs1Sj7w";

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

  // duplicate the customer object to avoid modifying the original since we're forced to set
  // customer_update.shipping to "auto" in order to get the automatic tax calculation
  console.log(
    `${requestId}:${new Date().toISOString()}: starting customer duplication from merchant server`
  );
  const cust = await stripe.customers.retrieve(CUSTOMER);
  const { name, email, address, shipping } = cust;
  const newCust = await stripe.customers.create({
    name,
    email,
    address,
    shipping,
  });
  console.log(
    `${requestId}:${new Date().toISOString()}: finished customer duplication from merchant server`
  );

  console.log(
    `${requestId}:${new Date().toISOString()}: starting stripe.checkout.sessions.create() from merchant server`
  );
  const session = await stripe.checkout.sessions.create({
    // automatic_tax: {
    //   enabled: true,
    // },
    customer: newCust.id,
    // customer_update: {
    //   shipping: "auto",
    // },
    shipping_options: [
      {
        shipping_rate: CONTINENTAL_SHIPPING,
      },
    ],
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
    `${requestId}:${new Date().toISOString()}: finished stripe.checkout.sessions.create() from merchant server`
  );

  res.json({ clientSecret: session.client_secret, session: session });
});

const requestCheckoutSession = async (
  requestId: string,
  paymentPageUrl: string
) => {
  console.log(
    `${requestId}:${new Date().toISOString()}: starting GET /v1/payment_pages/cs_test_... from merchant server`
  );
  const result = await axios.get(paymentPageUrl, {
    params: {
      key: process.env.STRIPE_PK || "",
    },
  });
  console.log(
    `${requestId}:${new Date().toISOString()}: finished GET /v1/payment_pages/cs_test_... from merchant server (prove we got a successful response: id=${
      result.data.id
    })`
  );
  return result.data;
};

// this version sets tax region based on the address
// app.post(
//   "/setAddress",
//   async (
//     req: Request<{
//       sessionId: string;
//       address: any;
//       requestSessionFirst: boolean;
//     }>,
//     res
//   ) => {
//     try {
//       const requestId = httpContext.get("requestId");
//       const { sessionId, address, requestSessionFirst } = req.body;
//       const paymentPageUrl = `https://api.stripe.com/v1/payment_pages/${sessionId}`;
//       if (requestSessionFirst) {
//         await requestCheckoutSession(requestId, paymentPageUrl);
//       }

//       console.log(
//         `${requestId}:${new Date().toISOString()}: starting POST /v1/payment_pages/cs_test_... from merchant server`
//       );
//       const params = new URLSearchParams();
//       params.append("key", process.env.STRIPE_PK || "");
//       // looks like empty string isn't allowed
//       // we probably need to set present but empty somehow? Not too important for now...
//       address.country && params.append("tax_region[country]", address.country);
//       address.state && params.append("tax_region[state]", address.state);
//       address.zip && params.append("tax_region[postal_code]", address.zip);
//       address.city && params.append("tax_region[city]", address.city);
//       address.line1 && params.append("tax_region[line1]", address.line1);
//       // doesn't seem like line2 should be that important but checkout sends it
//       address.line2 && params.append("tax_region[line2]", address.line2);
//       const ppage = await axios.post(
//         `https://api.stripe.com/v1/payment_pages/${sessionId}`,
//         params.toString(),
//         { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//       );
//       console.log(
//         `${requestId}:${new Date().toISOString()}: finished POST /v1/payment_pages/cs_test_... from merchant server`
//       );

//       res.json({ ppage: ppage.data });
//     } catch (err) {
//       console.log(`setAddress error: ${err}`);
//       res.status(400);
//     }
//   }
// );

app.post(
  "/setAddress",
  async (
    req: Request<{
      sessionId: string;
      address: any;
    }>,
    res
  ) => {
    try {
      const requestId = httpContext.get("requestId");
      const { sessionId, address } = req.body;
      const paymentPageUrl = `https://api.stripe.com/v1/payment_pages/${sessionId}`;
      const checkoutSessionUrl = `https://api.stripe.com/v1/checkout/sessions/${sessionId}`;

      console.log(
        `${requestId}:${new Date().toISOString()}: starting POST /v1/checkout/sessions/${sessionId} from merchant server`
      );

      const shippingRate =
        address.state === "AK" || address.state === "HI"
          ? AK_HI_SHIPPING
          : CONTINENTAL_SHIPPING;
      const params = new URLSearchParams();
      params.append("shipping_options[0][shipping_rate]", shippingRate);
      const cs = await axios.post(checkoutSessionUrl, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version":
            "2022-11-15;checkout_session_shipping_options_update_beta=v1",
        },
        auth: {
          username: process.env.STRIPE_SK || "",
          password: "",
        },
      });
      console.log(
        `${requestId}:${new Date().toISOString()}: finished POST /v1/checkout/sessions/${sessionId} from merchant server`
      );

      // request the payment page because the frontend can't construct enough session state from the checkout session
      const ppage = await requestCheckoutSession(requestId, paymentPageUrl);
      res.json({ ppage });
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

import express, { type Request } from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import * as path from "path";
import httpContext from "express-http-context";

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
  const session = await stripe.checkout.sessions.create({
    customer: "cus_OpvtuwflO7Q0ae",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "T-shirt",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    ui_mode: "custom",
    return_url: "http://example.com/success",
  });

  res.json({ clientSecret: session.client_secret });
});

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

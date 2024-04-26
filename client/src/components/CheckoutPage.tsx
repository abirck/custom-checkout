import React, { useEffect, useState, useRef } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { loadStripe } from "@stripe/stripe-js";
import { CustomCheckoutProvider } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { MyCheckoutSessionProvider } from "../providers/MyCheckoutSessionProvider";
const stripe = loadStripe("pk_test_FdYoaC1weOBHn0jv0KvgbHQZ", {
  betas: ["custom_checkout_beta_2"],
});

const CheckoutPage: React.FC<{ className?: string }> = ({ className }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initialCheckoutSession, setInitialCheckoutSession] = useState<
    any | null
  >(null);

  const doFetch = async () => {
    try {
      const res = await fetch(`/checkout`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({}),
      });

      if (res.status === 200) {
        const json = await res.json();
        if (json.clientSecret) {
          setClientSecret(json.clientSecret);
          setInitialCheckoutSession(json.session);
        } else {
          console.log(`Unexpected response: ${JSON.stringify(json)}`);
        }
      }
    } catch (err) {
      console.log(`fetch error: ${err}`);
    }

    setIsFetching(false);
  };

  if (!clientSecret || !initialCheckoutSession) {
    if (!isFetching) {
      doFetch();
      setIsFetching(true);
    }
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner className="content-center" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="pb-12 space-y-12">
        <div className="col-span-full">
          <MyCheckoutSessionProvider
            initialCheckoutSession={initialCheckoutSession}
          >
            <CustomCheckoutProvider stripe={stripe} options={{ clientSecret }}>
              <CheckoutForm />
            </CustomCheckoutProvider>
          </MyCheckoutSessionProvider>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

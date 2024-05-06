import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { loadStripe } from "@stripe/stripe-js";
import { CustomCheckoutProvider } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { MyCheckoutSessionProvider } from "../providers/MyCheckoutSessionProvider";
import { fetchCheckout } from "../helpers/serverHelper";
import DebugPanel from "./DebugPanel";
import DebugSettingsProvider, {
  type DebugSettings,
} from "../providers/DebugSettingsProvider";

const STRIPE_PK = "pk_test_FdYoaC1weOBHn0jv0KvgbHQZ";

const stripe = loadStripe(STRIPE_PK, {
  betas: ["custom_checkout_beta_2", "custom_checkout_internal_dev_beta"],
});

const CheckoutPage: React.FC<{ className?: string }> = ({ className }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<any | null>(null);
  const [debugSettings, setDebugSettings] = React.useState<DebugSettings>({
    shippingAddressDataSource: "my_checkout",
    retrieveAfterUpdateForMyCheckout: true,
    updateValidishAddressesOnly: true,
    requestPaymentPageFirstOnUpdate: true,
    debounceServerUpdateRequests: true,
  });

  const getNewCheckoutSession = async () => {
    setIsFetching(true);
    try {
      const { clientSecret, session } = await fetchCheckout();
      setClientSecret(clientSecret);
      setCheckoutSession(session);
    } finally {
      setIsFetching(false);
    }
  };

  React.useEffect(() => {
    getNewCheckoutSession();
  }, [debugSettings]);

  if (isFetching || !clientSecret || !checkoutSession) {
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
          <DebugSettingsProvider
            debugSettings={debugSettings}
            setDebugSettings={setDebugSettings}
          >
            <MyCheckoutSessionProvider
              checkoutSessionApiResource={checkoutSession}
            >
              <CustomCheckoutProvider
                stripe={stripe}
                options={{ clientSecret }}
              >
                <DebugPanel />
                <CheckoutForm />
              </CustomCheckoutProvider>
            </MyCheckoutSessionProvider>
          </DebugSettingsProvider>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

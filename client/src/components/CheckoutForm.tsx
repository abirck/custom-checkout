import React from "react";
import { PaymentElement } from "@stripe/react-stripe-js";
import PayButton from "./PayButton";
import EmailInput from "./EmailInput";
import LineItems from "./LineItems";
import AddressInput, { type Address } from "./AddressInput";
import { MyCheckoutSessionContext } from "../providers/MyCheckoutSessionProvider"
import { setAddress, parsePaymentPageAndMergeAddress } from "../helpers/serverHelper";
import { DebugSettingsContext } from "../providers/DebugSettingsProvider";

const CheckoutForm = () => {
  const { checkoutSession, setCheckoutSession } = React.useContext(
    MyCheckoutSessionContext
  );
  const { debugSettings } = React.useContext(DebugSettingsContext);

  const handleAddressChange = async (address: Address) => {
    if (checkoutSession?.sessionId) {
      // this method will handle updating the checkout session state with the response
      const res = await setAddress(checkoutSession.sessionId, address);
      if (debugSettings.retrieveAfterUpdateForMyCheckout) {
        // this is where we should simulate custom checkout refreshing from Stripe because we've resolved our "onAddressChange"
        // BUT the browser security blocks me from making the CORS request myself and I don't have a function from custom checkout
        // that we could use to do that and get accurate timings here. So instead I'll just add 75 ms delay
        const startTime = performance.now();
        console.info(`${new Date().toISOString()}: *SIMULATING* GET /v1/payment_pages/cs_test_...`);
        setTimeout(() => {
          const endTime = performance.now();
          const elapsedTime = endTime - startTime;
          console.info(`${new Date().toISOString()}: finished *SIMULATING* GET //v1/payment_pages/cs_test_... (${elapsedTime.toFixed(3)} ms)`);
          setCheckoutSession(parsePaymentPageAndMergeAddress(address, res.ppage));
        }, 75);
      } else {
        // update based on what we got from the server w/o refreshing from Stripe
        setCheckoutSession(parsePaymentPageAndMergeAddress(address, res.ppage));
      }
    }
  };
  return (
    <form>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <LineItems />
        </div>
        <div className="space-y-4">
          <EmailInput />
          <AddressInput onShippingAddressChanged={handleAddressChange} />
          <PaymentElement />
          <PayButton />
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;

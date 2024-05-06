import React from "react";
import { PaymentElement } from "@stripe/react-stripe-js";
import PayButton from "./PayButton";
import EmailInput from "./EmailInput";
import LineItems from "./LineItems";
import AddressInput, { type Address } from "./AddressInput";
import { MyCheckoutSessionContext } from "../providers/MyCheckoutSessionProvider";
import {
  setAddress,
  parsePaymentPageAndMergeAddress,
} from "../helpers/serverHelper";
import { DebugSettingsContext } from "../providers/DebugSettingsProvider";
import { useCustomCheckout } from "@stripe/react-stripe-js";

const DEBOUNCE_MS = 200;

const CheckoutForm = () => {
  const { checkoutSession, setCheckoutSession } = React.useContext(
    MyCheckoutSessionContext
  );
  const { debugSettings } = React.useContext(DebugSettingsContext);
  const { fetchUpdates } = useCustomCheckout();
  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  function debounce(fn) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, DEBOUNCE_MS);
    };
  }

  const debouncedSendServerNewAddress = debounce(
    async ({ address }: { address: Address }) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Cancel any in-flight request
      }

      abortControllerRef.current = new AbortController();
      try {
        sendServerNewAddress({
          address,
          abortController: abortControllerRef.current,
        });
      } catch (err) {
        // I think cancelled requests should end up here but they're not? Eh, look into it later
        console.error(`error sending new shipping address to server: ${err}`);
      }
    }
  );

  const sendServerNewAddress = async ({
    address,
    abortController,
  }: {
    address: Address;
    abortController?: AbortController;
  }) => {
    if (checkoutSession?.sessionId) {
      // this method will handle updating the checkout session state with the response
      const res = await setAddress({
        sessionId: checkoutSession.sessionId,
        address,
        abortController,
      });
      if (debugSettings.retrieveAfterUpdateForMyCheckout) {
        // this is where we should simulate custom checkout refreshing from Stripe because we've resolved our "onAddressChange"
        // BUT the browser security blocks me from making the CORS request myself and I don't have a function from custom checkout
        // that we could use to do that and get accurate timings here. So instead I'll just add 75 ms delay
        const startTime = performance.now();
        console.info(
          `${new Date().toISOString()}: calling custom_checkout.fetchUpdates()`
        );
        await fetchUpdates();
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        console.info(
          `${new Date().toISOString()}: finished custom_checkout.fetchUpdates() (${elapsedTime.toFixed(
            3
          )} ms)`
        );
        setCheckoutSession(parsePaymentPageAndMergeAddress(address, res.ppage));
      } else {
        // update based on what we got from the server w/o refreshing from Stripe
        setCheckoutSession(parsePaymentPageAndMergeAddress(address, res.ppage));
      }
    }
  };

  const handleAddressChange = async (address: Address) => {
    console.log(
      `debugSettings.debounceServerUpdateRequests: ${debugSettings.debounceServerUpdateRequests}`
    );
    if (debugSettings.debounceServerUpdateRequests) {
      debouncedSendServerNewAddress({ address });
    } else {
      await sendServerNewAddress({ address });
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

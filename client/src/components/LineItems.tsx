import React from "react";
import { useCustomCheckout } from "@stripe/react-stripe-js";
import { DebugSettingsContext } from "../providers/DebugSettingsProvider";
import {
  MyCheckoutSessionContext,
  type ShippingRate,
} from "../providers/MyCheckoutSessionProvider";
import { set } from "express-http-context";

export type TaxAmount = {
  amount: number;
  inclusive: boolean;
  displayName: string;
};

// try to make this the same as the custom checkout type so we can switch back and forth
export type LineItem = {
  name: string;
  amountSubtotal: number;
  taxAmounts: TaxAmount[] | null;
};

const LineItems = () => {
  const [lineItems, setLineItems] = React.useState<LineItem[] | null>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [shippingRate, setShippingRate] = React.useState<ShippingRate | null>(
    null
  );
  const {
    lineItems: customCheckoutLineItems,
    total: customCheckoutTotal,
    shipping: customCheckoutShipping,
  } = useCustomCheckout();
  const { debugSettings } = React.useContext(DebugSettingsContext);
  const { checkoutSession } = React.useContext(MyCheckoutSessionContext);

  React.useEffect(() => {
    if (
      debugSettings.shippingAddressDataSource === "my_checkout" &&
      checkoutSession
    ) {
      setLineItems(checkoutSession.lineItems);
      setTotal(checkoutSession.total);
      setShippingRate(checkoutSession.shippingRate);
    } else if (debugSettings.shippingAddressDataSource === "custom_checkout") {
      setLineItems(customCheckoutLineItems);
      setTotal(customCheckoutTotal.total);
      if (customCheckoutShipping) {
        const { displayName, amount } = customCheckoutShipping.shippingOption;
        setShippingRate({
          displayName: displayName || "Shipping",
          amount,
        });
      } else {
        setShippingRate(null);
      }
    }
  }, [
    customCheckoutLineItems,
    customCheckoutTotal,
    checkoutSession,
    debugSettings,
  ]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 text-2xl font-bold">Cart:</div>
      {lineItems &&
        lineItems.map((lineItem) => {
          return (
            <>
              <div>{lineItem.name}</div>
              <div>${lineItem.amountSubtotal / 100}</div>
              {lineItem.taxAmounts?.map((tax) => {
                if (tax.inclusive) {
                  return null;
                }
                return (
                  <>
                    <div className="text-gray-600">{tax.displayName}</div>
                    <div className="text-gray-600">${tax.amount / 100}</div>
                  </>
                );
              })}
            </>
          );
        })}
      {shippingRate && (
        <>
          <div>{shippingRate.displayName}</div>
          <div>${shippingRate.amount / 100}</div>
        </>
      )}
      <div className="font-bold">Total</div>
      <div className="font-bold">${total / 100}</div>
    </div>
  );
};

export default LineItems;

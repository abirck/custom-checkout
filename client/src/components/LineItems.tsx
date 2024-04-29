import React from "react";
import { useCustomCheckout } from "@stripe/react-stripe-js";
import { DebugSettingsContext } from "../providers/DebugSettingsProvider";
import { MyCheckoutSessionContext } from "../providers/MyCheckoutSessionProvider";

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
  const { lineItems: customCheckoutLineItems, total: customCheckoutTotal } = useCustomCheckout();
  const { debugSettings } = React.useContext(DebugSettingsContext);
  const { checkoutSession } = React.useContext(
    MyCheckoutSessionContext
  );

  React.useEffect(() => {
    if (debugSettings.lineItemsDataSource === "my_checkout" && checkoutSession) {
      console.log(
        "reloading line items from server response (my checkout)"
      );
      setLineItems(checkoutSession.lineItems);
      setTotal(checkoutSession.total);
    } else if (debugSettings.lineItemsDataSource === "custom_checkout") {
      console.log("reloading shipping address from custom checkout");
      setLineItems(customCheckoutLineItems);
      setTotal(customCheckoutTotal.total);
    }
  }, [customCheckoutLineItems, customCheckoutTotal, checkoutSession, debugSettings]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 text-2xl font-bold">Cart:</div>
      {lineItems &&
        lineItems.map((lineItem) => {
          return (
            <>
              <div>{lineItem.name}</div>
              <div>{lineItem.amountSubtotal / 100}</div>
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
              <div className="font-bold">Total</div>
              <div className="font-bold">${total / 100}</div>
            </>
          );
        })}
    </div>
  );
};

export default LineItems;

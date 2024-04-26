import React from "react";
import { useCustomCheckout } from "@stripe/react-stripe-js";

const LineItems = () => {
  const { lineItems } = useCustomCheckout();

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 text-2xl font-bold">Cart:</div>
      {lineItems.map((lineItem) => {
        return (
          <>
            <div>{lineItem.name}</div>
            <div>{lineItem.amountSubtotal}</div>
          </>
        );
      })}
    </div>
  );
};

export default LineItems;

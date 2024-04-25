import React from "react";
import { useCustomCheckout } from "@stripe/react-stripe-js";
import LoadingSpinner from "./LoadingSpinner";

const LineItems = () => {
  const { lineItems } = useCustomCheckout();
  const [loading, setLoading] = React.useState(true);

  // spinner maybe not required now b/c CheckoutForm hides this behind a
  // spinner for now but we might need later for updates
  React.useEffect(() => {
    if (!loading && (!lineItems || !lineItems.length)) {
      setLoading(true);
    } else if (loading && lineItems && lineItems.length) {
      setLoading(false);
    }
  }, [lineItems, loading, setLoading]);

  if (loading) {
    return <LoadingSpinner className="content-center" />;
  }

  console.log(`lineItems.length: ${lineItems.length}`);

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

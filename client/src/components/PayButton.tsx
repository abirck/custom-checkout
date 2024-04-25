import React from "react";
import { useCustomCheckout } from "@stripe/react-stripe-js";

const PayButton = () => {
  const { confirm, canConfirm, confirmationRequirements } = useCustomCheckout();
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await confirm();
      window.alert("payment success!");
    } catch (e) {
      window.alert(`payment error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8"
      disabled={!canConfirm || loading}
      onClick={handleClick}
    >
      Pay
    </button>
  );
};

export default PayButton;

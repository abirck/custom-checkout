import React from "react";
import { useCustomCheckout } from "@stripe/react-stripe-js";

const PayButton = () => {
  const { confirm, canConfirm, confirmationRequirements } = useCustomCheckout();
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await confirm();
      // initially I assumed this was success but I was incorrect
      // need to figure out how to really detect success and show
      // appropriate error message
      window.alert("payment success!");
    } catch (e) {
      window.alert(`payment error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={`bg-blue-500 text-white font-bold py-2 px-4 rounded mt-8 ${
          !canConfirm || loading
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-700"
        }`}
        disabled={!canConfirm || loading}
        onClick={handleClick}
      >
        Pay
      </button>
      {!canConfirm && !loading && (
        <div className="mt-8 p-2 bg-red-400 text-white text-xs rounded">
          Missing confirmation requirements:{" "}
          {confirmationRequirements.join(", ")}
        </div>
      )}
    </>
  );
};

export default PayButton;

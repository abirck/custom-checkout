import React from "react";
import { PaymentElement } from "@stripe/react-stripe-js";
import PayButton from "./PayButton";
import EmailInput from "./EmailInput";
import LineItems from "./LineItems";

const CheckoutForm = () => {
  return (
    <form>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <LineItems />
        </div>
        <div className="space-y-4">
          <EmailInput />
          <PaymentElement />
          <PayButton />
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;

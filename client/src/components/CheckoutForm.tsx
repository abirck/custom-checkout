import React from "react";
import { PaymentElement } from "@stripe/react-stripe-js";
import PayButton from "./PayButton";
import EmailInput from "./EmailInput";

const CheckoutForm = () => {
  return (
    <form>
      <EmailInput />
      <PaymentElement />
      <PayButton />
    </form>
  );
};

export default CheckoutForm;

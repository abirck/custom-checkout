import React from "react";
import { PaymentElement } from "@stripe/react-stripe-js";
import PayButton from "./PayButton";
import EmailInput from "./EmailInput";
import LineItems from "./LineItems";
import AddressInput, { Address } from "./AddressInput";

const CheckoutForm = () => {
  const handleAddressChange = (address: Address) => {
    console.log(`Address: ${JSON.stringify(address, null, 2)}`);
  };

  return (
    <form>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <LineItems />
        </div>
        <div className="space-y-4">
          <EmailInput />
          <AddressInput onChange={handleAddressChange} />
          <PaymentElement />
          <PayButton />
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;

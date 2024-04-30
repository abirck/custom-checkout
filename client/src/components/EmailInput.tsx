import React, { useState } from "react";
import { useCustomCheckout } from "@stripe/react-stripe-js";

const EmailInput = () => {
  const [email, setEmail] = useState("");
  const [hasSetValidEmail, setHasSetValidEmail] = useState(false);
  const { email: customCheckoutEmail, updateEmail } = useCustomCheckout();

  // init to custom checkout value
  React.useEffect(() => {
    customCheckoutEmail && setEmail(customCheckoutEmail);
  }, []);

  const isEmailValid = (email: string): boolean => {
    // A common, but relatively basic regular expression for email validation
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    setEmail(val);
    if (isEmailValid(val)) {
      updateEmail(val);
      setHasSetValidEmail(true);
    } else if (hasSetValidEmail) {
      updateEmail("");
      setHasSetValidEmail(false);
    }
  };

  return (
    <label className="space-y-2">
      <span>Email</span>
      <input
        className="email-input border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        type="text"
        value={email}
        onChange={handleChange}
      />
    </label>
  );
};

export default EmailInput;

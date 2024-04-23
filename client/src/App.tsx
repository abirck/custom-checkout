import React from "react";
import CheckoutPage from "./components/CheckoutPage";

const App: React.FC = () => {
  return (
    <div>
      <CheckoutPage className="mx-auto max-w-xs sm:max-w-xl lg:max-w-3xl py-12 sm:py-16 lg:py-24" />
    </div>
  );
};

export default App;

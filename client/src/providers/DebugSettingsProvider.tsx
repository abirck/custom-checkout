import React, { ReactNode } from "react";

export type ShippingAddressDataSource = "custom_checkout" | "my_checkout";

export type DebugSettings = {
  // unfortunately named since this now controls both the address &  line item controls
  // should rename
  shippingAddressDataSource: ShippingAddressDataSource;
  retrieveAfterUpdateForMyCheckout: boolean;
  updateValidishAddressesOnly: boolean;
  requestPaymentPageFirstOnUpdate: boolean;
  debounceServerUpdateRequests: boolean;
};

type DebugSettingsContextType = {
  debugSettings: DebugSettings;
  setDebugSettings: React.Dispatch<React.SetStateAction<DebugSettings>>;
};

export const DebugSettingsContext =
  React.createContext<DebugSettingsContextType>({
    debugSettings: {
      shippingAddressDataSource: "my_checkout",
      retrieveAfterUpdateForMyCheckout: true,
      updateValidishAddressesOnly: true,
      requestPaymentPageFirstOnUpdate: true,
      debounceServerUpdateRequests: true,
    },
    setDebugSettings: () => {
      return Promise.resolve();
    },
  });

const DebugSettingsProvider = ({
  debugSettings,
  setDebugSettings,
  children,
}: {
  debugSettings: DebugSettings;
  setDebugSettings: React.Dispatch<React.SetStateAction<DebugSettings>>;
  children: ReactNode;
}) => {
  return (
    <DebugSettingsContext.Provider value={{ debugSettings, setDebugSettings }}>
      {children}
    </DebugSettingsContext.Provider>
  );
};

export default DebugSettingsProvider;

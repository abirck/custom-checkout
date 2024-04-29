import React, { ReactNode } from "react";

export type ShippingAddressDataSource = "custom_checkout" | "my_checkout";
export type LineItemsDataSource = "custom_checkout" | "my_checkout";

export type DebugSettings = {
  shippingAddressDataSource: ShippingAddressDataSource;
  lineItemsDataSource: LineItemsDataSource;
  retrieveAfterUpdateForMyCheckout: boolean;
  updateValidishAddressesOnly: boolean;
};

type DebugSettingsContextType = {
  debugSettings: DebugSettings;
  setDebugSettings: React.Dispatch<React.SetStateAction<DebugSettings>>;
};

export const DebugSettingsContext =
  React.createContext<DebugSettingsContextType>({
    debugSettings: {
      shippingAddressDataSource: "my_checkout",
      lineItemsDataSource: "my_checkout",
      retrieveAfterUpdateForMyCheckout: true,
      updateValidishAddressesOnly: true,
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

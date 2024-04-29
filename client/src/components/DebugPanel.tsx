import React, { useState } from "react";
import SlideOver from "./SlideOver";
import {
  DebugSettings,
  DebugSettingsContext,
  ShippingAddressDataSource,
  LineItemsDataSource,
} from "../providers/DebugSettingsProvider";
import Select, { SelectOption } from "./Select";

const areDebugSettingsEqual = (
  settings1: DebugSettings,
  settings2: DebugSettings
): boolean => {
  return (
    settings1.shippingAddressDataSource ===
      settings2.shippingAddressDataSource &&
    settings1.lineItemsDataSource === settings2.lineItemsDataSource
  );
};

const DebugPanel: React.FC<{ className?: string }> = ({ className }) => {
  const shippingAddressDataSourceOptions: SelectOption<ShippingAddressDataSource>[] =
    [
      {
        key: 0,
        text: "Custom Checkout",
        value: "custom_checkout",
      },
      {
        key: 1,
        text: "My Checkout",
        value: "my_checkout",
      },
    ];
  const lineItemsDataSourceOptions: SelectOption<ShippingAddressDataSource>[] =
    [
      {
        key: 0,
        text: "Custom Checkout",
        value: "custom_checkout",
      },
      {
        key: 1,
        text: "My Checkout",
        value: "my_checkout",
      },
    ];

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const { debugSettings, setDebugSettings } =
    React.useContext(DebugSettingsContext);
  const [shippingAddressDataSource, setShippingAddressDataSource] =
    React.useState<ShippingAddressDataSource>(
      debugSettings.shippingAddressDataSource
    );
  const [lineItemsDataSource, setLineItemsDataSource] =
    React.useState<LineItemsDataSource>(debugSettings.lineItemsDataSource);

  const handleDebugButtonClick = () => {
    setSlideOverOpen(true);
  };

  React.useEffect(() => {
    // if closing set new settings
    const newSettings: DebugSettings = {
      shippingAddressDataSource,
      lineItemsDataSource,
    };
    if (!slideOverOpen && !areDebugSettingsEqual(debugSettings, newSettings)) {
      console.log(
        `current settings: ${JSON.stringify(debugSettings, null, 2)}`
      );
      console.log(`new settings: ${JSON.stringify(newSettings, null, 2)}`);
      setDebugSettings(newSettings);
    }
  }, [slideOverOpen]);

  return (
    <>
      <div className="absolute top-4 right-4">
        <button
          className="border-black border-2 p-2 rounded"
          onClick={handleDebugButtonClick}
        >
          Debug Settings
        </button>
      </div>
      <SlideOver
        title="Debug Panel"
        open={slideOverOpen}
        setOpen={setSlideOverOpen}
      >
        <div className="space-y-4">
          <Select
            label="Shipping Address Data Source"
            options={shippingAddressDataSourceOptions}
            selected={shippingAddressDataSource}
            setSelected={setShippingAddressDataSource}
          />
          <Select
            label="Line Items Data Source"
            options={lineItemsDataSourceOptions}
            selected={lineItemsDataSource}
            setSelected={setLineItemsDataSource}
          />
        </div>
      </SlideOver>
    </>
  );
};

export default DebugPanel;

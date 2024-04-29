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
    settings1.lineItemsDataSource === settings2.lineItemsDataSource &&
    settings1.retrieveAfterUpdateForMyCheckout === settings2.retrieveAfterUpdateForMyCheckout
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
  const lineItemsDataSourceOptions: SelectOption<LineItemsDataSource>[] =
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

  const [retrieveAfterUpdateForMyCheckout, setRetrieveAfterUpdateForMyCheckout] =
    React.useState<boolean>(debugSettings.retrieveAfterUpdateForMyCheckout);


  const handleDebugButtonClick = () => {
    setSlideOverOpen(true);
  };

  const handleRetrieveAfterUpdateForMyCheckoutChange = (e: { target: { checked: boolean } }) => {
    const selected = e.target.checked;
    setRetrieveAfterUpdateForMyCheckout(selected);
  };

  React.useEffect(() => {
    // if closing set new settings
    const newSettings: DebugSettings = {
      shippingAddressDataSource,
      lineItemsDataSource,
      retrieveAfterUpdateForMyCheckout,
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
          <span>(Close to have new settings take effect)</span>
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
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="serverRefresh"
                aria-describedby="comments-description"
                name="comments"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={retrieveAfterUpdateForMyCheckout}
                onChange={handleRetrieveAfterUpdateForMyCheckoutChange}
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="serverRefresh" className="font-medium text-gray-900">
                Refresh state from Stripe after finishing update hook
              </label>
            </div>
          </div>
        </div>
      </SlideOver >
    </>
  );
};

export default DebugPanel;

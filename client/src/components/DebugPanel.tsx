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
    settings1.retrieveAfterUpdateForMyCheckout ===
      settings2.retrieveAfterUpdateForMyCheckout &&
    settings1.updateValidishAddressesOnly ===
      settings2.updateValidishAddressesOnly &&
    settings1.requestPaymentPageFirstOnUpdate ===
      settings2.requestPaymentPageFirstOnUpdate
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
  const lineItemsDataSourceOptions: SelectOption<LineItemsDataSource>[] = [
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
  const [
    retrieveAfterUpdateForMyCheckout,
    setRetrieveAfterUpdateForMyCheckout,
  ] = React.useState<boolean>(debugSettings.retrieveAfterUpdateForMyCheckout);
  const [updateValidishAddressesOnly, setUpdateValidishAddressesOnly] =
    React.useState<boolean>(debugSettings.updateValidishAddressesOnly);
  const [requestPaymentPageFirstOnUpdate, setRequestPaymentPageFirstOnUpdate] =
    React.useState<boolean>(debugSettings.requestPaymentPageFirstOnUpdate);

  const handleDebugButtonClick = () => {
    setSlideOverOpen(true);
  };

  const handleRetrieveAfterUpdateForMyCheckoutChange = (e: {
    target: { checked: boolean };
  }) => {
    const selected = e.target.checked;
    setRetrieveAfterUpdateForMyCheckout(selected);
  };

  const handleUpdateValidishAddressesOnlyChange = (e: {
    target: { checked: boolean };
  }) => {
    const selected = e.target.checked;
    setUpdateValidishAddressesOnly(selected);
  };

  const handleRequestPaymentPageFirstOnUpdate = (e: {
    target: { checked: boolean };
  }) => {
    const selected = e.target.checked;
    setRequestPaymentPageFirstOnUpdate(selected);
  };

  React.useEffect(() => {
    // if closing set new settings
    const newSettings: DebugSettings = {
      shippingAddressDataSource,
      lineItemsDataSource,
      retrieveAfterUpdateForMyCheckout,
      updateValidishAddressesOnly,
      requestPaymentPageFirstOnUpdate,
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
                name="serverRefresh"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={retrieveAfterUpdateForMyCheckout}
                onChange={handleRetrieveAfterUpdateForMyCheckoutChange}
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label
                htmlFor="serverRefresh"
                className="font-medium text-gray-900"
              >
                Refresh state from Stripe after finishing update hook
              </label>
            </div>
          </div>
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="addressUpdateFrequency"
                aria-describedby="comments-description"
                name="addressUpdateFrequency"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={updateValidishAddressesOnly}
                onChange={handleUpdateValidishAddressesOnlyChange}
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label
                htmlFor="addressUpdateFrequency"
                className="font-medium text-gray-900"
              >
                Update server address on valid-ish addresses only
              </label>
            </div>
          </div>
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="requestPaymentPageFirstOnUpdate"
                aria-describedby="comments-description"
                name="requestPaymentPageFirstOnUpdate"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={requestPaymentPageFirstOnUpdate}
                onChange={handleRequestPaymentPageFirstOnUpdate}
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label
                htmlFor="requestPaymentPageFirstOnUpdate"
                className="font-medium text-gray-900"
              >
                When making an update request from the merchant server, should
                we request the page from Stripe before modifying?
              </label>
            </div>
          </div>
        </div>
      </SlideOver>
    </>
  );
};

export default DebugPanel;

import React from "react";
import { MyCheckoutSessionContext } from "../providers/MyCheckoutSessionProvider";
import { useCustomCheckout } from "@stripe/react-stripe-js";
import { DebugSettingsContext } from "../providers/DebugSettingsProvider";

type AddressInputProps = {
  disabled?: boolean;
  // right now only fires when address is valid. Should make this a debug option
  onShippingAddressChanged?(address: Address): Promise<void>;
};

export type Address = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  zip: string;
};

const addressLooksValidish = (address: Address): boolean => {
  return !!(
    address.line1 &&
    address.city &&
    address.country &&
    address.zip &&
    address.state
  );
};

const areAddressesEqual = (address1: Address, address2: Address): boolean => {
  return (
    address1.name == address2.name &&
    address1.line1 == address2.line1 &&
    address1.line2 == address2.line2 &&
    address1.city == address2.city &&
    address1.state == address2.state &&
    address1.country == address2.country &&
    address1.zip == address2.zip
  );
};

const AddressInput = ({
  disabled,
  onShippingAddressChanged,
}: AddressInputProps) => {
  const { checkoutSession } = React.useContext(MyCheckoutSessionContext);
  const {
    shippingAddress: customCheckoutShippingAddress,
    updateShippingAddress,
  } = useCustomCheckout();
  const { debugSettings } = React.useContext(DebugSettingsContext);

  if (!checkoutSession) {
    return null;
  }

  const [name, setName] = React.useState("");
  const [line1, setLine1] = React.useState("");
  const [line2, setLine2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [zip, setZip] = React.useState("");

  const getCurrentAddress = (overrides?: any): Address => {
    return {
      name,
      line1,
      line2,
      city,
      state,
      country,
      zip,
      ...overrides,
    };
  };

  const handleAddressChange = async (newAddress: Address) => {
    // ACTUALLY, don't update custom checkout for now to make sure it's not
    // updating the checkout session when we don't want it to

    // always update custom checkout since these values stay on the client
    // and we need to fill out shipping address to be able to confirm
    // const customCheckoutAddress = {
    //   name: newAddress.name,
    //   address: {
    //     country: newAddress.country,
    //     city: newAddress.city,
    //     line1: newAddress.line1,
    //     line2: newAddress.line2,
    //     state: newAddress.state,
    //     postal_code: newAddress.zip,
    //   },
    // };
    // updateShippingAddress(customCheckoutAddress);

    // update on our server
    if (
      !debugSettings.updateValidishAddressesOnly ||
      addressLooksValidish(newAddress)
    ) {
      if (onShippingAddressChanged) {
        await onShippingAddressChanged(newAddress);
      }
    }
  };

  // whenever we get an update from the server make sure it's reflected here
  React.useEffect(() => {
    const currentAddress = getCurrentAddress();
    if (
      debugSettings.shippingAddressDataSource === "my_checkout" &&
      !areAddressesEqual(currentAddress, checkoutSession.shippingAddress)
    ) {
      setName(checkoutSession.shippingAddress.name);
      setLine1(checkoutSession.shippingAddress.line1);
      setLine2(checkoutSession.shippingAddress.line2);
      setCity(checkoutSession.shippingAddress.city);
      setState(checkoutSession.shippingAddress.state);
      setCountry(checkoutSession.shippingAddress.country);
      setZip(checkoutSession.shippingAddress.zip);
    }
  }, [checkoutSession, debugSettings]);

  React.useEffect(() => {
    const currentAddress = getCurrentAddress();
    if (
      debugSettings.shippingAddressDataSource === "custom_checkout" &&
      customCheckoutShippingAddress
    ) {
      const { name, address } = customCheckoutShippingAddress;
      const customCheckoutAddress: Address = {
        name: name || "",
        line1: address.line1 || "",
        line2: address.line2 || "",
        city: address.city || "",
        state: address.state || "",
        country: address.country || "",
        zip: address.postal_code || "",
      };
      if (!areAddressesEqual(currentAddress, customCheckoutAddress)) {
        setName(customCheckoutAddress.name);
        setLine1(customCheckoutAddress.line1);
        setLine2(customCheckoutAddress.line2);
        setCity(customCheckoutAddress.city);
        setState(customCheckoutAddress.state);
        setCountry(customCheckoutAddress.country);
        setZip(customCheckoutAddress.zip);
      }
    }
  }, [customCheckoutShippingAddress, debugSettings]);

  // it looks like checkout session gets tax calculated up front by immediately posting a region
  // update to the server on load so I guess we should do the same thing
  React.useEffect(() => {
    handleAddressChange(checkoutSession.shippingAddress);
  }, []);

  const handleNameChange = (e: { target: { value: string } }) => {
    const newName = e.target.value;
    setName(newName);
    handleAddressChange(getCurrentAddress({ name: newName }));
  };

  const handleLine1Change = (e: { target: { value: string } }) => {
    const newLine1 = e.target.value;
    setLine1(newLine1);
    handleAddressChange(getCurrentAddress({ line1: newLine1 }));
  };

  const handleLine2Change = (e: { target: { value: string } }) => {
    const newLine2 = e.target.value;
    setLine2(newLine2);
    handleAddressChange(getCurrentAddress({ line2: newLine2 }));
  };

  const handleCityChange = (e: { target: { value: string } }) => {
    const newCity = e.target.value;
    setCity(newCity);
    handleAddressChange(getCurrentAddress({ city: newCity }));
  };

  const handleStateChange = (e: { target: { value: string } }) => {
    const newState = e.target.value;
    setState(newState);
    handleAddressChange(getCurrentAddress({ state: newState }));
  };

  const handleZipChange = (e: { target: { value: string } }) => {
    const newZip = e.target.value;
    setZip(newZip);
    handleAddressChange(getCurrentAddress({ zip: newZip }));
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="space-y-2">
          <span>Full Name</span>
          <input
            className="full-name-input border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            type="text"
            value={name}
            onChange={handleNameChange}
            disabled={disabled}
          />
        </label>
      </div>
      <div>
        <label className="space-y-2">
          <span>Address Line 1</span>
          <input
            className="full-name-input border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            type="text"
            disabled={disabled}
            value={line1}
            onChange={handleLine1Change}
          />
        </label>
      </div>
      <div>
        <label className="space-y-2">
          <span>Address Line 2</span>
          <input
            className="full-name-input border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            type="text"
            disabled={disabled}
            value={line2}
            onChange={handleLine2Change}
          />
        </label>
      </div>
      <div>
        <label className="space-y-2">
          <span>City</span>
          <input
            className="full-name-input border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            type="text"
            disabled={disabled}
            value={city}
            onChange={handleCityChange}
          />
        </label>
      </div>
      <div>
        <label className="space-y-2">
          <span>State</span>
          <input
            className="full-name-input border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            type="text"
            disabled={disabled}
            value={state}
            onChange={handleStateChange}
          />
        </label>
      </div>
      <div>
        <label className="space-y-2">
          <span>Zip</span>
          <input
            className="full-name-input border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            type="text"
            disabled={disabled}
            value={zip}
            onChange={handleZipChange}
          />
        </label>
      </div>
      <div>
        <label className="space-y-2">
          <span>Country</span>
          <input
            className="full-name-input border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            type="text"
            disabled
            value="United States"
          />
        </label>
      </div>
    </div>
  );
};

export default AddressInput;

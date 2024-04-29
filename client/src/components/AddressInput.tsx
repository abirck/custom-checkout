import React from "react";
import { MyCheckoutSessionContext } from "../providers/MyCheckoutSessionProvider";
import { useCustomCheckout } from "@stripe/react-stripe-js";
import { DebugSettingsContext } from "../providers/DebugSettingsProvider";

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

const AddressInput = ({ disabled }: { disabled?: boolean }) => {
  const { checkoutSession, setAddressOnServer } = React.useContext(
    MyCheckoutSessionContext
  );
  const { shippingAddress, updateShippingAddress } = useCustomCheckout();
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

  const setAddress = (address: Address) => {
    // update on our server
    setAddressOnServer(address);

    // and set locally on the client or else we won't be able to finish the
    // session since we don't have an API to set on server side yet
    const customCheckoutAddress = {
      name: address.name,
      address: {
        country: address.country,
        city: address.city,
        line1: address.line1,
        line2: address.line2,
        state: address.state,
        postal_code: address.zip,
      },
    };
    updateShippingAddress(customCheckoutAddress);
  };

  // whenever we get an update from the server make sure it's reflected here
  React.useEffect(() => {
    if (debugSettings.shippingAddressDataSource === "my_checkout") {
      console.log(
        "reloading shipping address from server response (my checkout)"
      );
      setName(checkoutSession.shippingAddress.name);
      setLine1(checkoutSession.shippingAddress.line1);
      setLine2(checkoutSession.shippingAddress.line2);
      setCity(checkoutSession.shippingAddress.city);
      setState(checkoutSession.shippingAddress.state);
      setCountry(checkoutSession.shippingAddress.country);
      setZip(checkoutSession.shippingAddress.zip);
    } else if (debugSettings.shippingAddressDataSource === "custom_checkout") {
      console.log("reloading shipping address from custom checkout");
      setName(shippingAddress?.name || "");
      setLine1(shippingAddress?.address.line1 || "");
      setLine2(shippingAddress?.address.line2 || "");
      setCity(shippingAddress?.address.city || "");
      setState(shippingAddress?.address.state || "");
      setCountry(shippingAddress?.address.country || "");
      setZip(shippingAddress?.address.zip || "");
    }
  }, [shippingAddress, checkoutSession, debugSettings]);

  // it looks like checkout session gets tax calculated up front by immediately posting a region
  // update to the server on load so I guess we should do the same thing
  React.useEffect(() => {
    if (addressLooksValidish(checkoutSession.shippingAddress)) {
      setAddress(checkoutSession.shippingAddress);
    }
  }, []);

  const sendOnChange = (override?: any) => {
    const newAddress = {
      name,
      line1,
      line2,
      city,
      state,
      country,
      zip,
      ...override,
    };
    if (
      checkoutSession &&
      !areAddressesEqual(newAddress, checkoutSession.shippingAddress) &&
      addressLooksValidish(newAddress)
    ) {
      setAddress(newAddress);
    }
  };

  const handleNameChange = (e: { target: { value: string } }) => {
    const newName = e.target.value;
    setName(newName);
    sendOnChange({ name: newName });
  };

  const handleLine1Change = (e: { target: { value: string } }) => {
    const newLine1 = e.target.value;
    setLine1(newLine1);
    sendOnChange({ line1: newLine1 });
  };

  const handleLine2Change = (e: { target: { value: string } }) => {
    const newLine2 = e.target.value;
    setLine2(newLine2);
    sendOnChange({ line2: newLine2 });
  };

  const handleCityChange = (e: { target: { value: string } }) => {
    const newCity = e.target.value;
    setCity(newCity);
    sendOnChange({ city: newCity });
  };

  const handleStateChange = (e: { target: { value: string } }) => {
    const newState = e.target.value;
    setState(newState);
    sendOnChange({ state: newState });
  };

  const handleZipChange = (e: { target: { value: string } }) => {
    const newZip = e.target.value;
    setZip(newZip);
    sendOnChange({ zip: newZip });
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

import React from "react";
import { MyCheckoutSessionContext } from "../providers/MyCheckoutSessionProvider";

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

  // whenever we get an update from the server make sure it's reflected here
  React.useEffect(() => {
    console.log("reloading address from server");
    setName(checkoutSession.shippingAddress.name);
    setLine1(checkoutSession.shippingAddress.line1);
    setLine2(checkoutSession.shippingAddress.line2);
    setCity(checkoutSession.shippingAddress.city);
    setState(checkoutSession.shippingAddress.state);
    setCountry(checkoutSession.shippingAddress.country);
    setZip(checkoutSession.shippingAddress.zip);
  }, [checkoutSession]);

  // it looks like checkout session gets tax calculated up front by immediately posting a region
  // update to the server on load so I guess we should do the same thing
  React.useEffect(() => {
    if (addressLooksValidish(checkoutSession.shippingAddress)) {
      setAddressOnServer(checkoutSession.shippingAddress);
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
      setAddressOnServer(newAddress);
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

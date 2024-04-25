import React from "react";

export type Address = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  zip: string;
};

const AddressInput = ({
  disabled,
  onChange,
}: {
  disabled?: boolean;
  onChange?: (address: Address) => void;
}) => {
  // ppage doesn't seem to send over a billing address and although there is a shipping address on
  // the customer object it's not on custom checkout's `shippingAddress` so we have to use the
  // version of a ppage request we make I guess
  // const { shippingAddress } = useCustomCheckout();

  const [name, setName] = React.useState("");
  const [line1, setLine1] = React.useState("");
  const [line2, setLine2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [zip, setZip] = React.useState("");

  // override is kind lame, could probably find a better way to do it with a little more investigation
  const sendOnChange = (override?: any) => {
    onChange &&
      onChange({
        name,
        line1,
        line2,
        city,
        state,
        country,
        zip,
        ...override,
      });
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
          <span>Country</span>
          <input
            className="full-name-input border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            type="text"
            disabled
            value="United States"
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
    </div>
  );
};

export default AddressInput;

import React, { ReactNode } from "react";
import { Address } from "../components/AddressInput";

export type MyCheckoutSession = {
  sessionId: string;
  shippingAddress: Address;
};

type MyCheckoutSessionContextType = {
  checkoutSession: MyCheckoutSession | null;
  setAddressOnServer: (address: Address) => Promise<void>;
};

export const MyCheckoutSessionContext =
  React.createContext<MyCheckoutSessionContextType>({
    checkoutSession: null,
    setAddressOnServer: () => {
      return Promise.resolve();
    },
  });

type MyCheckoutSessionProviderProps = {
  initialCheckoutSession: any;
  children?: ReactNode;
};

const setAddress = async (
  sessionId: string,
  address: Address
): Promise<{ ppage: any }> => {
  const res = await fetch(`/setAddress`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify({ sessionId, address }),
  });

  if (res.status === 200) {
    return await res.json();
  } else {
    throw new Error("Error setting address on server");
  }
};

// necessary because session doesn't contain in-progress shipping
// address so we just megre in the address we sent to the server
const parsePaymentPageAndMergeAddress = (address: Address, ppage: any) => {
  return {
    sessionId: ppage.session_id,
    shippingAddress: address,
  };
};

const parseCheckoutSession = (session: any): MyCheckoutSession => {
  const { shipping } = session.customer;
  const { address } = shipping;
  return {
    sessionId: session.id,
    shippingAddress: {
      name: shipping.name,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      country: address.country,
      state: address.state,
      zip: address.postal_code,
    },
  };
};

export const MyCheckoutSessionProvider = ({
  initialCheckoutSession,
  children,
}: MyCheckoutSessionProviderProps) => {
  const [checkoutSession, setCheckoutSession] =
    React.useState<MyCheckoutSession | null>(null);

  const setAddressOnServer = async (address: Address) => {
    if (!checkoutSession?.sessionId) {
      return;
    }
    const res = await setAddress(checkoutSession.sessionId, address);
    setCheckoutSession(parsePaymentPageAndMergeAddress(address, res.ppage));
  };

  React.useEffect(() => {
    // just assume initial session is always there
    if (initialCheckoutSession) {
      setCheckoutSession(parseCheckoutSession(initialCheckoutSession));
    }
  }, []);

  return (
    <MyCheckoutSessionContext.Provider
      value={{ checkoutSession, setAddressOnServer }}
    >
      {children}
    </MyCheckoutSessionContext.Provider>
  );
};

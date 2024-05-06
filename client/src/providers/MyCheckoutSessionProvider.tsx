import React, { ReactNode } from "react";
import { type Address } from "../components/AddressInput";
import { type LineItem, type TaxAmount } from "../components/LineItems";

export type ShippingRate = {
  displayName: string;
  amount: number;
};

export type MyCheckoutSession = {
  sessionId: string;
  shippingAddress: Address;
  lineItems: LineItem[];
  total: number;
  shippingRate: ShippingRate | null;
};

type MyCheckoutSessionContextType = {
  checkoutSession: MyCheckoutSession | null;
  setCheckoutSession: React.Dispatch<
    React.SetStateAction<MyCheckoutSession | null>
  >;
};

export const MyCheckoutSessionContext =
  React.createContext<MyCheckoutSessionContextType>({
    checkoutSession: null,
    setCheckoutSession: () => {
      return Promise.resolve();
    },
  });

type MyCheckoutSessionProviderProps = {
  checkoutSessionApiResource: any;
  children?: ReactNode;
};

const parseCheckoutSession = (session: any): MyCheckoutSession => {
  const { shipping } = session.customer;
  const { address } = shipping;
  // lame we're just hard coding this but the cehckout session returned by 'create'
  // doesn't list any line items and I haven't bothered to make my own `init` call
  // so just pretend this data came from the server
  const lineItems: LineItem[] = [
    {
      name: "Sixty Dollar Product",
      amountSubtotal: 6000,
      taxAmounts: [],
    },
  ];
  const total = 6000;
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
    lineItems: [],
    shippingRate: null,
    total,
  };
};

export const MyCheckoutSessionProvider = ({
  checkoutSessionApiResource,
  children,
}: MyCheckoutSessionProviderProps) => {
  const [checkoutSession, setCheckoutSession] =
    React.useState<MyCheckoutSession | null>(null);

  React.useEffect(() => {
    setCheckoutSession(parseCheckoutSession(checkoutSessionApiResource));
  }, [checkoutSessionApiResource]);

  return (
    <MyCheckoutSessionContext.Provider
      value={{ checkoutSession, setCheckoutSession }}
    >
      {children}
    </MyCheckoutSessionContext.Provider>
  );
};

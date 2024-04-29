import React, { ReactNode } from "react";
import { type Address } from "../components/AddressInput";
import { setAddress } from "../helpers/serverHelper";
import { type LineItem, type TaxAmount } from "../components/LineItems";

export type MyCheckoutSession = {
  sessionId: string;
  shippingAddress: Address;
  lineItems: LineItem[];
  total: number;
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
  checkoutSessionApiResource: any;
  children?: ReactNode;
};

// necessary because session doesn't contain in-progress shipping
// address so we just megre in the address we sent to the server
const parsePaymentPageAndMergeAddress = (address: Address, ppage: any) => {
  const { total } = ppage.line_item_group;
  const lineItems = ppage.line_item_group.line_items.map(
    (item: any): LineItem => {
      return {
        name: item.name,
        amountSubtotal: item.subtotal,
        taxAmounts: item.tax_amounts.map((tax: any): TaxAmount => {
          return {
            amount: tax.amount,
            displayName: tax.tax_rate.display_name,
            inclusive: tax.inclusive,
          };
        }),
      };
    }
  );
  return {
    sessionId: ppage.session_id,
    shippingAddress: address,
    lineItems,
    total,
  };
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
    total,
  };
};

export const MyCheckoutSessionProvider = ({
  checkoutSessionApiResource,
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
    setCheckoutSession(parseCheckoutSession(checkoutSessionApiResource));
  }, [checkoutSessionApiResource]);

  return (
    <MyCheckoutSessionContext.Provider
      value={{ checkoutSession, setAddressOnServer }}
    >
      {children}
    </MyCheckoutSessionContext.Provider>
  );
};

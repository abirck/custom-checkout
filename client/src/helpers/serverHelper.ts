import { Address } from "../components/AddressInput";

export const fetchCheckout = async (): Promise<{
  clientSecret: string;
  session: any;
}> => {
  const res = await fetch(`/checkout`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify({}),
  });

  if (res.status === 200) {
    const json = await res.json();
    const { clientSecret, session } = json;
    if (clientSecret) {
      return { clientSecret, session };
    } else {
      console.log(
        `Unexpected response  from /checkout: ${JSON.stringify(json)}`
      );
    }
  }

  throw new Error(`Unexpected status from /checkout: ${status}`);
};

export const setAddress = async (
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
    throw new Error(`/setAddress return status: ${res.status}`);
  }
};

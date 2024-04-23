import React, { useEffect, useState, useRef } from "react";
import LoadingSpinner from "./LoadingSpinner";

const CheckoutPage: React.FC<{ className?: string }> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const isLoadingRef = useRef(isLoading);
  const [clientSecret, setClientSecret] = useState<string | undefined>();

  // Keep stateRef current up-to-date
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const doFetch = async () => {
    fetch(
      `/checkout`,
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({}),
      })
      .then(async (res) => {
        if (res.status === 200) {
          // check to see we didn't cancel
          if (isLoadingRef.current) {
            const json = await res.json();
            if (json.clientSecret) {
              setClientSecret(json.clientSecret);
            } else {
              console.log(`Unexpected response: ${JSON.stringify(json)}`);
            }
            setIsFetching(false);
            setIsLoading(false);
          }
        }
      })
      .catch((err) => {
        console.log(`fetch error: ${err}`);
      });
  };

  if (isLoading) {
    if (!isFetching) {
      doFetch();
      setIsFetching(true);
    }
    return <LoadingSpinner className="content-center" />;
  }

  return (
    <div className={className}>
      <div className="pb-12 space-y-12">
        <div className="col-span-full">
          <div>{clientSecret}</div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

import React from "react";
import { ReactNode, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";

export const RecoilObserver = ({
  node,
  event,
}: {
  node: any;
  event: Function;
}) => {
  const value = useRecoilValue(node);

  useEffect(() => {
    event(value);
  }, [event, value]);

  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

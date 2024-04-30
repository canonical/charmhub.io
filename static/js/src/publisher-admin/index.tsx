import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";

import Root from "./routes/root";
import NotFound from "./pages/NotFound";
import Publicise from "./pages/Publicise";
import Settings from "./pages/Settings";
import Listing from "./pages/Listing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/:packageName",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/:packageName/publicise",
        element: <Publicise />,
        children: [
          {
            path: "/:packageName/publicise/badges",
            element: <Publicise />,
          },
          {
            path: "/:packageName/publicise/cards",
            element: <Publicise />,
          },
        ],
      },
      {
        path: "/:packageName/settings",
        element: <Settings />,
      },
      {
        path: "/:packageName/listing",
        element: <Listing />,
      },
    ],
  },
]);

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <RecoilRoot>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </RecoilRoot>
);

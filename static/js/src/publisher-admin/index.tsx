import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";

import Root from "./routes/root";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

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
        path: "/:packageName/foo",
        element: <h1>Hello</h1>,
      },
      {
        path: "/:packageName/settings",
        element: <Settings />,
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

import React from "react";
import { Provider as JotaiProvider } from "jotai";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  RouterProvider,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import * as Sentry from "@sentry/react";
import { sentryReactErrorHandlers } from "../base/sentry";

import Root from "./routes/root";
import NotFound from "./pages/NotFound";
import Publicise from "./pages/Publicise";
import Settings from "./pages/Settings";
import Listing from "./pages/Listing";
import Collaboration from "./pages/Collaboration";
import Releases from "./pages/Releases";

Sentry.addIntegration(
  Sentry.reactRouterV7BrowserTracingIntegration({
    useEffect: React.useEffect,
    useLocation,
    useNavigationType,
    createRoutesFromChildren,
    matchRoutes,
  })
);
Sentry.addIntegration(Sentry.replayIntegration());

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
        path: "/:packageName/releases",
        element: <Releases />,
      },
      {
        path: "/:packageName/listing",
        element: <Listing />,
      },
      {
        path: "/:packageName/collaboration",
        element: <Collaboration />,
      },
    ],
  },
]);

const container = document.getElementById("root");
const root = createRoot(container!, sentryReactErrorHandlers);
root.render(
  <JotaiProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </JotaiProvider>
);

import React from "react";
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
import { RecoilRoot } from "recoil";
import * as Sentry from "@sentry/react";

import Root from "./routes/root";
import NotFound from "./pages/NotFound";
import Publicise from "./pages/Publicise";
import Settings from "./pages/Settings";
import Listing from "./pages/Listing";
import Collaboration from "./pages/Collaboration";
import Releases from "./pages/Releases";

Sentry.init({
  dsn: window.SENTRY_DSN,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/charmhub\.io/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

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
const root = createRoot(container!);
root.render(
  <RecoilRoot>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </RecoilRoot>
);

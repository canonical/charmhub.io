import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";

import App from "./components/App";
import { sentryReactErrorHandlers } from "../base/sentry";

const queryClient = new QueryClient();

const root = createRoot(
  document.getElementById("app")!,
  sentryReactErrorHandlers
);
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

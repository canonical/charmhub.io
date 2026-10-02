import { Provider as JotaiProvider } from "jotai";
import { createRoot } from "react-dom/client";
import { sentryReactErrorHandlers } from "../../../base/sentry";
import { QueryClient, QueryClientProvider } from "react-query";

import App from "./components/App";

const queryClient = new QueryClient();

const root = createRoot(
  document.getElementById("tab-content")!,
  sentryReactErrorHandlers
);
root.render(
  <QueryClientProvider client={queryClient}>
    <JotaiProvider>
      <App />
    </JotaiProvider>
  </QueryClientProvider>
);

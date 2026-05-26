import { Provider as JotaiProvider } from "jotai";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";

import App from "./components/App";

const queryClient = new QueryClient();

const root = createRoot(document.getElementById("tab-content")!);
root.render(
  <QueryClientProvider client={queryClient}>
    <JotaiProvider>
      <App />
    </JotaiProvider>
  </QueryClientProvider>
);

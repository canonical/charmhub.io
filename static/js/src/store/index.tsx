import { createRoot } from "react-dom/client";

import App from "./components/App";
import { sentryReactErrorHandlers } from "../base/sentry";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement, sentryReactErrorHandlers);
root.render(<App />);

import { cookiePolicy } from "@canonical/cookie-policy";
import "./polyfills";
import "./navigation";
import "./tooltip-icon-modal";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";
import { getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
cookiePolicy();
const URL = "http://localhost:8081/collect";
console.log("Initializing Faro with URL:", URL);
initializeFaro({
  url: URL,

  app: {
    name: "charmhub-io-fe",
  },
  instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
});

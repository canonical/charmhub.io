import { cookiePolicy } from "@canonical/cookie-policy";
import "./polyfills";
import "./navigation";
import "./tooltip-icon-modal";

cookiePolicy();
import { getWebInstrumentations, initializeFaro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";
import { OtlpHttpTransport } from "@grafana/faro-transport-otlp-http";

const faro = initializeFaro({
  transports: [
    new OtlpHttpTransport({
      tracesURL: "http://localhost:4318/v1/traces",
      // logsURL: "http://localhost:4318/v1/traces",
    }),
  ],
  app: {
    name: "my-app",
    version: "1.0.0",
  },
  instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
});

const { trace, context } = faro.api.getOTEL();

try {
  const tracer = trace.getTracer("default");
  const span = tracer.startSpan("click");
  context.with(trace.setSpan(context.active(), span), () => {
    console.log("AFAFAFAF");
    span.end();
  });
} catch (e) {
  console.error("Error in tracing", e);
}

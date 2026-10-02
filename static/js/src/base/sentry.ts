import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: window.SENTRY_DSN,
  ignoreErrors: ["AbortError"],
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/(?:staging\.)?charmhub\.io/,
  ],
});

export const sentryReactErrorHandlers = {
  onCaughtError: Sentry.reactErrorHandler(),
  onUncaughtError: Sentry.reactErrorHandler(),
};

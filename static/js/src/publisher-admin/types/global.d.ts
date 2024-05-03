declare interface Window {
  CSRF_TOKEN: string;
  SENTRY_DSN: string;
  testSentryError: Function; // This is to be removed
}

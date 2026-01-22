import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1036,
  e2e: {
    setupNodeEvents() {
      // implement node event listeners here
    },
    supportFile: false,
    blockHosts: [
      "www.googletagmanager.com",
      "analytics.google.com",
      "*.analytics.google.com",
      "www.google-analytics.com",
      "assets.ubuntu.com",
    ],
  },
});

module.exports = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost.test",
    customExportConditions: [""],
  },
  transformIgnorePatterns: ["node_modules/@canonical/(?!react-components)"],
  moduleNameMapper: {
    "\\.(scss|sass|css)$": "identity-obj-proxy",
  },
  setupFiles: ["./jest.polyfills.js"],
};

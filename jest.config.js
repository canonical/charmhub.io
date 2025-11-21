module.exports = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost.test",
    customExportConditions: [""],
  },
  coverageReporters: ["html", "cobertura"],
  coverageDirectory: "coverage/js",
  transformIgnorePatterns: [
    "node_modules/@canonical/(?!(react-components|global-nav))",
  ],
  moduleNameMapper: {
    "\\.(scss|sass|css)$": "identity-obj-proxy",
  },
  setupFiles: ["./jest.polyfills.js"],
};

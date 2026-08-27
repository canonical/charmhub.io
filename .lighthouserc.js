module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        "http://127.0.0.1:8045/",
        "http://127.0.0.1:8045/?q=postgresql",
        "http://127.0.0.1:8045/postgresql",
      ],
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      includePassedAssertions: true,
      assertions: {
        "categories:performance": [
          "warn",
          { aggregationMethod: "median", minScore: 0.6 },
        ],
        "categories:accessibility": [
          "error",
          { aggregationMethod: "median", minScore: 0.85 },
        ],
        "categories:best-practices": [
          "error",
          { aggregationMethod: "median", minScore: 0.95 },
        ],
        "categories:seo": [
          "error",
          { aggregationMethod: "median", minScore: 0.95 },
        ],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};

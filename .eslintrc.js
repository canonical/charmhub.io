module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["vitest", "react", "@typescript-eslint", "jsx-a11y"],
  globals: {
    ga: "readonly",
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    "vitest/globals": true,
    vitest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  parserOptions: {
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "linebreak-style": ["error", "unix"],
    semi: ["error", "always"],
    "object-curly-spacing": ["error", "always"],
    "react/react-in-jsx-scope": "off",
    "react/display-name": "off",
    "react/no-unescaped-entities": "off",
    // Disabled for good reason, see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
    "no-undef": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["jest", "react", "@typescript-eslint", "jsx-a11y"],
  globals: {
    ga: "readonly",
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    "jest/globals": true,
    jest: true,
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
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-types": "off",
        "prefer-const": "off",
        "react/no-children-prop": "off",
        "no-sparse-arrays": "off",
      },
    },
  ],
};

/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const entry = require("./webpack.config.entry.js");
const rules = require("./webpack.config.rules.js");

const production = process.env.ENVIRONMENT !== "devel";

module.exports = {
  entry: entry,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "static/js/dist"),
  },
  mode: production ? "production" : "development",
  devtool: production ? "source-map" : "eval-source-map",
  module: {
    rules: rules,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
};

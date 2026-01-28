module.exports = [
  {
    test: /\.js$/,
    // Exclude node_modules from using babel-loader
    // except some that use ES6 modules and need to be transpiled:
    // such as swiper http://idangero.us/swiper/get-started/
    // and also react-dnd related
    exclude: /node_modules\/(?!(dom7|ssr-window)\/).*/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-react"],
      },
    },
  },
  {
    test: /\.s[ac]ss$/i,
    use: [
      "style-loader",
      "css-loader",
      {
        loader: "sass-loader",
        options: {
          sassOptions: {
            quietDeps: true,
            silenceDeprecations: ["import", "global-builtin"],
          },
        },
      },
    ],
  },
  {
    test: /\.css$/i,
    use: ["style-loader", "css-loader"],
  },
  // loaders are evaluated from bottom to top (right to left)
  // so first transpile via babel, then expose as global
  {
    test: require.resolve(__dirname + "/static/js/src/public/docs/index.js"),
    use: ["babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/base/base.js"),
    use: ["babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/store-details/index.js"
    ),
    use: ["babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/public/topics/index.js"),
    use: ["babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/public/details/index.ts"),
    use: ["babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/details/overview/index.js"
    ),
    use: ["babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/details/docs/index.js"
    ),
    use: ["babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/details/resources/index.ts"
    ),
    use: ["babel-loader"],
  },
  {
    test: /\.tsx?/,
    use: ["ts-loader"],
  },
];

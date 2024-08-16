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
    use: ["style-loader", "css-loader", "sass-loader"],
  },
  {
    test: /\.css$/i,
    use: ["style-loader", "css-loader"],
  },
  // loaders are evaluated from bottom to top (right to left)
  // so first transpile via babel, then expose as global
  {
    test: require.resolve(__dirname + "/static/js/src/public/docs/index.js"),
    use: ["expose-loader?exposes=charmhub.docs", "babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/base/base.js"),
    use: ["expose-loader?exposes=charmhub.base", "babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/store-details/index.js"
    ),
    use: ["expose-loader?exposes=charmhub.store", "babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/public/topics/index.js"),
    use: ["expose-loader?exposes=charmhub.topics", "babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/public/details/index.ts"),
    use: ["expose-loader?exposes=charmhub.details", "babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/details/overview/index.js"
    ),
    use: ["expose-loader?exposes=charmhub.details.overview", "babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/details/docs/index.js"
    ),
    use: ["expose-loader?exposes=charmhub.details.docs", "babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/details/history/index.js"
    ),
    use: ["expose-loader?exposes=charmhub.details.history", "babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/publisher/list-page.js"),
    use: ["expose-loader?exposes=charmhub.publisher.list", "babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/publisher/listing-page.ts"
    ),
    use: ["expose-loader?exposes=charmhub.publisher.listing", "babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/details/integrate/index.ts"
    ),
    use: ["expose-loader?exposes=charmhub.details.integrate", "babel-loader"],
  },
  {
    test: require.resolve(
      __dirname + "/static/js/src/public/details/resources/index.ts"
    ),
    use: ["expose-loader?exposes=charmhub.resources", "babel-loader"],
  },
  {
    test: /\.tsx?/,
    use: ["ts-loader"],
  },
];

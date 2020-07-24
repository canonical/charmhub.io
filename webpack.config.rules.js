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
  // loaders are evaluated from bottom to top (right to left)
  // so first transpile via babel, then expose as global
  {
    test: require.resolve(__dirname + "/static/js/src/public/about/index.js"),
    use: ["expose-loader?exposes=charmhub.about", "babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/base/base.js"),
    use: ["expose-loader?exposes=charmhub.base", "babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/public/store/index.js"),
    use: ["expose-loader?exposes=charmhub.store", "babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/public/details/index.js"),
    use: ["expose-loader?exposes=charmhub.details", "babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/publisher/list-page.js"),
    use: ["expose-loader?exposes=charmhub.publisher.list", "babel-loader"],
  },
  {
    test: require.resolve(__dirname + "/static/js/src/publisher/settings.js"),
    use: ["expose-loader?exposes=charmhub.publisher.settings", "babel-loader"],
  },
];

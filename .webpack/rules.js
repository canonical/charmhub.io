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
    },
  },
  // loaders are evaluated from bottom to top (right to left)
  // so first transpile via babel, then expose as global
  {
    test: "/static/js/public/about/index.js",
    use: ["expose-loader?charmhub.about", "babel-loader"],
  },
  {
    test: "/static/js/base/base.js",
    use: ["expose-loader?charmhub.base", "babel-loader"],
  },
  {
    test: "/static/js/public/store/index.js",
    use: ["expose-loader?charmhub.store", "babel-loader"],
  },
  {
    test: "/static/js/public/details/index.js",
    use: ["expose-loader?charmhub.details", "babel-loader"],
  },
];

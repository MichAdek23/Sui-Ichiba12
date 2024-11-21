const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = function override(config, env) {
  // Add the polyfill plugin
  config.plugins = [
    ...config.plugins,
    new NodePolyfillPlugin()
  ];

  // Resolve fallbacks for missing Node.js modules in the browser
  config.resolve.fallback = {
    net: false,
    tls: false,
    fs: false,
    stream: require.resolve("stream-browserify"),
    events: require.resolve("events/"),
    util: require.resolve("util/"),
    path: require.resolve("path-browserify"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify")
  };

  return config;
};

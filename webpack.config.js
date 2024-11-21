const suiModule = require('@mysten/sui.js/src/some-internal-module');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    resolve: {
      alias: {
        events: require.resolve("events/"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
        http2: false,
        async_hooks: false,
        child_process: false
      },
      fallback: {
        // Ensure fallback for other modules
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        path: require.resolve("path-browserify"),
        os: require.resolve("os-browserify/browser"),
        util: require.resolve("util"),
        net: false,
        tls: false,
      },
    },
    plugins: [
      new NodePolyfillPlugin(),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  };
  
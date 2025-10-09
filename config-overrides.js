// This file is included to deal with issues regarding react-scripts v5.0.0 and web3
// Provided from Web3 documentation -> https://github.com/ChainSafe/web3.js#troubleshooting-and-known-issues

const webpack = require('webpack');
const { override } = require("customize-cra");

const ignoreWarnings = value => config => {
    config.ignoreWarnings = value;
    return config;
  };
  

module.exports = function override(config) {
    
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url")
    })
    config.resolve.fallback = fallback;
    config.ignoreWarnings = [/Failed to parse source map/];
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    })
  
    return config;
    
}
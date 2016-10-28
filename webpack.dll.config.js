const path = require('path');
const webpack = require('webpack');

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

const entries = {
  vendor: [
    "react",
    "react-dom",
    "react-router",
    "react-mixin",
    "reflux",
    "amazeui-react",
    "jquery"
  ]
}

function makeConfig(option) {
  const debug = option.debug && true;

  let config = {
    entry: entries,
    output: {
      path: path.join(__dirname, (debug ? "__build": "build")),
      filename: 'scripts/[name].[hash:8].js',
      library: '[name]'
    },
    plugins: [
      new webpack.DllPlugin({
        path: path.join(__dirname, (debug ? "__build": "build"), '[name]-manifest.json'),
        name: '[name]'
      }),
      new UglifyJsPlugin({output: {comments: false}, compress: {warnings: false }})
      //new webpack.DefinePlugin({'process.env':{'NODE_ENV': JSON.stringify('production')}})
    ]
  }
  return config;
}


module.exports = makeConfig;

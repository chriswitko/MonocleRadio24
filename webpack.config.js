let ExtractTextPlugin = require('extract-text-webpack-plugin')
// let HtmlWebpackPlugin = require('html-webpack-plugin')
// let CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
// const webpack = require("webpack");

module.exports = {
  target: 'electron-renderer',
  entry: './app.js',
  output: {
    path: path.join(__dirname, './'),
    filename: 'app.bundle.js'
  },
  devtool: 'eval',
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.html$/,
        exclude: path.join(__dirname, 'node_modules'),
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        exclude: path.join(__dirname, 'node_modules'),
        loader: ExtractTextPlugin.extract(['css', 'sass'])
      },
      {
        test: /\.js$/,
        exclude: path.join(__dirname, 'node_modules'),
        loader: 'babel-loader'
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // new ExtractTextPlugin('app.bundle.css'),
    // new HtmlWebpackPlugin({ template: './index.html' }),
    // new CopyWebpackPlugin([{from: './main.js'}]),
    // new CopyWebpackPlugin([{from: './package.json'}]),
  ]
}

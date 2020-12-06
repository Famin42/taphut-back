/**
 * This assumes it's run by Serverless and not directly.
 */
const _ = require('lodash');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

const appDirectory = path.resolve(__dirname, '..');
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const entries = _.mapValues(
  slsw.lib.entries,
  (file) => `./${path.relative(appDirectory, path.resolve(process.cwd(), file))}`,
);
const modulesDir = resolveApp('node_modules');

module.exports = {
  stats: {
    colors: true,
  },
  devtool: 'source-map',
  entry: entries,
  context: appDirectory,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  target: 'node',
  externals: [nodeExternals({ modulesDir })], // ignore all modules in node_modules folder
  resolve: {
    modules: [resolveApp('./src'), modulesDir],
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/, /\.test\.ts/],
        use: {
          loader: 'ts-loader',
          options: { happyPackMode: true },
        },
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      eslint: resolveApp('./.eslintrc.js'),
      eslintOptions: {
        cache: true,
      },
    }),
  ],
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
};

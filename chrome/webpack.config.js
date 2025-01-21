const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.ts',
    popup: './src/pages/popup.ts',
    options: './src/pages/options.ts',
    facebookCreate: './src/functions/facebook/createListing.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      return pathData.chunk.name === 'popup' ? 'pages/[name].js' : '[name].js';
    }
  },
  mode: 'development',
  devtool: 'inline-source-map',
  cache: false,
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins:[
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'imgs', to: './imgs' },
        { from: 'data', to: './data' },
        {from: 'src/pages/*.{html,css}', to: 'pages/[name][ext]'}
      ]
    })
  ]
};

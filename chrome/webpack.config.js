const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.ts',
    popup: './src/pages/popup.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      return pathData.chunk.name === 'popup' ? 'pages/[name].js' : '[name].js';
    }
  },
  mode: 'development',
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
        { from: 'static', to: '.', globOptions: { ignore: ['**/pages/**'] } },
        { from: 'manifest.json', to: '.' },
        { from: 'src/pages/popup.html', to: 'pages/popup.html' },
        { from: 'static/pages/popup.css', to: 'pages/popup.css' }
      ]
    })
  ]
};

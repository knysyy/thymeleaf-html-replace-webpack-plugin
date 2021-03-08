const { resolve } = require('path');

module.exports = {
  target: 'node',

  entry: './src/index.ts',

  output: {
    filename: 'index.js',
    path: resolve(__dirname, 'dist'),
    library: 'ThymeleafHtmlReplaceWebpackPlugin',
    libraryExport: 'default',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: true
  },

  resolve: {
    extensions: ['.js', '.ts']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env', '@babel/typescript'],
            plugins: [
              '@babel/proposal-class-properties',
              '@babel/plugin-proposal-object-rest-spread'
            ]
          }
        }
      }
    ]
  }
};

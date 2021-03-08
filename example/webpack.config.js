const ThymeleafHtmlReplaceWebpackPlugin = require('../dist');
const path = require('path');

module.exports = {
  entry: './static/webpack/js/index.js',

  output: {
    path: path.resolve(__dirname, 'static'),
    publicPath: '/',
    filename: 'js/index.js?[contenthash]'
  },

  resolve: {
    extensions: ['.js']
  },

  plugins: [
    new ThymeleafHtmlReplaceWebpackPlugin({
      cwd: path.resolve(__dirname, 'static/webpack/templates'),
      entry: '**/*.html',
      output: path.resolve(__dirname, 'static/templates'),
      extensions: ['js'],
      patterns: [
        {
          find: '(<script th:src=")(@{[/]?%s})("></script>)',
          replace: '$1%s$3'
        }
      ]
    })
  ]
};

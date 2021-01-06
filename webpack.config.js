const path = require('path')

module.exports = {
  entry: './src/client/client.ts',
  watch: true,
  devtool: false,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'dist'),
  },
}

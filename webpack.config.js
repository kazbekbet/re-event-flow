const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 're-event.js',
    path: path.resolve(__dirname, 'dist'),
    library: 're-event',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
};

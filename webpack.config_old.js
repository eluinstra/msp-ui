const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const electronConfiguration = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'electron-main',
  resolve: {
    alias: {
      ['@']: path.resolve(__dirname, 'src')
    },
    extensions: ['.tsx', '.ts', '.js', '.css', '.scss'],
  },
  module: {
    rules: [{
      test: /\.ts$/,
      include: /src/,
      use: [{ 
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      }]
    }]
  },
  output: {
    path: __dirname + '/dist',
    filename: 'main.js'
  }
}

const reactConfiguration = {
  mode: 'development',
  entry: './src/renderer.tsx',
  target: 'electron-renderer',
  devtool: 'source-map',
  resolve: {
    alias: {
      ['@']: path.resolve(__dirname, 'src')
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: /src/,
        use: [{
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }]
      }
    ]
  },
  output: {
    path: __dirname + '/dist',
    filename: 'renderer.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
}

module.exports = [
  electronConfiguration,
  reactConfiguration
];

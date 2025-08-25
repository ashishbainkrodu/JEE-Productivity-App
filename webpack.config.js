const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './index.web.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        'react-native$': 'react-native-web',
        'react-native-svg': 'react-native-svg-web',
        'react-native-vector-icons/MaterialIcons': path.resolve(__dirname, 'src/components/WebIcon.tsx'),
        'react-native-chart-kit': path.resolve(__dirname, 'src/components/WebChart.tsx'),
      },
      fallback: {
        "fs": false,
        "path": false,
        "os": false,
        "crypto": false,
        "stream": false,
        "util": false,
        "buffer": false,
        "querystring": false,
        "url": false,
        "zlib": false,
        "http": false,
        "https": false,
        "assert": false,
        "constants": false,
        "_stream_duplex": false,
        "_stream_passthrough": false,
        "_stream_readable": false,
        "_stream_transform": false,
        "_stream_writable": false,
      }
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                noEmit: false,
                skipLibCheck: true,
                noImplicitAny: false,
                strict: false,
              },
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
    },
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
      },
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    stats: {
      errorDetails: true,
      children: false,
    },
  };
};

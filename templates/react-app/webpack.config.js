const ArcGISPlugin = require('@arcgis/webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const path = require('path');

module.exports = function build(env, arg) {
  const config = {
    entry: {
      index: ['./src/client/index.scss', '@babel/polyfill', './src/client/index.tsx'],
    },
    output: {
      path: path.join(__dirname, 'dist'),
      chunkFilename: 'chunks/[name].[contenthash:8].js',
      publicPath: '',
      globalObject: 'this',
    },
    devtool: 'source-map',
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 3001,
      writeToDisk: true,
      open: true
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        {
          test: /\.html$/,
          type: 'asset/resource',
          exclude: /node_modules/,
        },
        {
          test: /\.(ttf|eot|svg|png|jpg|gif|ico|wsv|otf|woff(2)?)(\?[a-z0-9]+)?$/,
          use: [
            {
              loader: 'file-loader'
            }
          ]
        },
        {
          test: /\.css$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: true
              },
            }
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // ??????????????????????????? style-loader; ??? JS ?????????????????? style ??????
            arg.mode !== "production"
              ? "style-loader"
              : MiniCssExtractPlugin.loader,
            // ??? CSS ????????? CommonJS ??????
            "css-loader",
            {
              // ??? Sass ????????? CSS
              loader: "sass-loader",
              options: {
                // `dart-sass` ?????????
                implementation: require("sass"),
                sassOptions: {
                  /**
                   * ????????????????????????????????????????????????????????????????????? ?????????????????????????????????????????? fibers ????????????????????????????????????????????????
                   * https://webpack.docschina.org/loaders/sass-loader/
                   */
                  fiber: require("fibers"),
                },
              },
            },
          ],
        },
      ],
    },
    optimization: {
      minimize: arg.mode === 'production',
      splitChunks: {
        chunks: 'all',
        minSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: Infinity,
        automaticNameDelimiter: '~',
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      },
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending further investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              comments: false,
            },
            sourceMap: arg.mode === 'development'
          },
        }),
        new CssMinimizerPlugin()
      ],
      runtimeChunk: {
        name: 'runtime',
      },
    },
    plugins: [
      new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),

      new MiniCssExtractPlugin({
        filename: '[name].bundle.css',
        chunkFilename: '[id].css',
      }),

      new ArcGISPlugin(),

      new HtmlWebPackPlugin({
        title: 'Aaron`s Map',
        template: './public/index.ejs',
        filename: './index.html',
        favicon: './public/favicon.ico',
        chunksSortMode: 'none',
        inlineSource: '.(css)$',
        mode: arg.mode,
      }),

      new HtmlWebPackPlugin({
        template: './public/oauth-callback.html',
        filename: './oauth-callback.html',
        chunksSortMode: 'none',
        inject: false,
      }),
    ],
    resolve: {
      modules: [
        path.resolve(__dirname, '/src'),
        path.resolve(__dirname, 'node_modules/')
      ],
      extensions: ['.ts', '.tsx', '.js', '.scss', '.css'],
    },
  };

  if (arg.mode === 'production') {
    // config.devtool = 'source-map';
    config.devtool = false;
    config.plugins.push(
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
      }),
    );
  }

  return config;
};

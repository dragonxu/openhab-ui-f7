const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const WebpackAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const path = require('path')

function resolvePath (dir) {
  return path.join(__dirname, '..', dir)
}

const env = process.env.NODE_ENV || 'development'
const target = process.env.TARGET || 'web'
const buildSourceMaps = process.env.SOURCE_MAPS || false
const isCordova = target === 'cordova'

// const apiBaseUrl = 'http://openhab:8080' // 'http://demo.openhab.org:8080' // 'http://localhost:8080'
const apiBaseUrl = 'http://localhost:8080'

module.exports = {
  mode: env,
  entry: [
    './src/js/app.js'
  ],
  output: {
    path: resolvePath(isCordova ? 'cordova/www' : 'www'),
    filename: 'js/app.js',
    publicPath: ''
  },
  resolve: {
    extensions: ['.mjs', '.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolvePath('src')
    }
  },
  devtool: env === 'production' ? (buildSourceMaps) ? 'source-map' : 'none' : 'eval-source-map',
  devServer: {
    hot: true,
    // open: true,
    // compress: true,
    contentBase: '/www/',
    disableHostCheck: true,
    // watchOptions: {
    //   poll: true,
    // },
    proxy: {
      '/rest': apiBaseUrl,
      '/chart': apiBaseUrl,
      '/proxy': apiBaseUrl,
      '/icon': apiBaseUrl
    }
  },
  module: {
    rules: [
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: []
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        include: [
          resolvePath('src'),
          resolvePath('node_modules/framework7'),
          resolvePath('node_modules/framework7-vue'),
          resolvePath('node_modules/framework7-react'),
          resolvePath('node_modules/template7'),
          resolvePath('node_modules/dom7'),
          resolvePath('node_modules/ssr-window'),
          resolvePath('node_modules/vue-echarts'),
          resolvePath('node_modules/resize-detector'),
          resolvePath('node_modules/later-again')
        ]
      },

      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.styl(us)?$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'images/[name].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.nearley$/,
        use: [
          'nearley-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.TARGET': JSON.stringify(target)
    }),
    new VueLoaderPlugin(),
    ...(env === 'production' ? [
      // Production only plugins
      new UglifyJsPlugin({
        exclude: /\/later-again.*constants/,
        // uglifyOptions: {
        //   compress: {
        //     // warnings: false,
        //   },
        // },
        sourceMap: true,
        parallel: true
      }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
          map: { inline: false }
        }
      }),
      new webpack.optimize.ModuleConcatenationPlugin()
    ] : [
      // Development only plugins
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin()
    ]),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './src/index.html',
      inject: true,
      minify: env === 'production' ? {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      } : false
    }),
    new MiniCssExtractPlugin({
      filename: 'css/app.css'
    }),
    new CopyWebpackPlugin([
      {
        from: resolvePath('src/static'),
        to: resolvePath(isCordova ? 'cordova/www/static' : 'www/static')
      },
      {
        from: resolvePath('src/manifest.json'),
        to: resolvePath('www/manifest.json')
      }
    ]),
    ...(!isCordova ? [
      new WorkboxPlugin.InjectManifest({
        swSrc: resolvePath('src/service-worker.js')
      })
    ] : [])
    // new WebpackAnalyzerPlugin({
    //   analyzerMode: 'static',
    //   reportFilename: '../report.html'
    // })
  ]
}

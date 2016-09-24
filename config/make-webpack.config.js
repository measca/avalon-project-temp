// 引用需要用到的组件
let path = require('path')
let fs = require('fs')
let webpack = require('webpack')
let glob = require('glob')
let ExtractTextPlugin = require('extract-text-webpack-plugin')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin

// 源文件所在全路径
let srcDir = path.resolve(__dirname, '../src')
// 打包输出全路径
let assets = path.resolve(__dirname, '../assets')
// 组件所在全路径
let nodeModPath = path.resolve(__dirname, '../node_modules')
// 不知道怎么描述
let pathMap = require('../src/pathmap.json')

// 获取所有需要打包的JS文件
var entries = {};

// 自动生成入口文件，入口js名必须和入口文件名相同
// 例如，a页的入口文件是a.html，那么在js目录下必须有一个a.js作为入口文件
let plugins = (function () {
  let entryHtml = glob.sync(srcDir + '/view/*.html')
  let r = []
  entryHtml.forEach((filePath) => {
    let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
    let conf = {
      template: 'html!' + filePath,
      filename: filename + '.html'
    }
    conf.inject = 'body'
    conf.chunks = []
    var jsPath = path.resolve(srcDir, 'controller/' + filename + ".js")
    var scssPath = path.resolve(srcDir, 'style/' + filename + ".scss")
    if (fs.existsSync(jsPath)) {
      entries[filename] = jsPath
      conf.chunks = ['vender', filename]
      conf.chunks.push('vender');
      conf.chunks.push('filename');
    }
    if(fs.existsSync(scssPath)) {
      var scssKeyName = "scss" + filename
      entries[scssKeyName] = [path.resolve(srcDir, 'base/baseStyle.scss'), scssPath]
      conf.chunks.push(scssKeyName)
    }

    r.push(new HtmlWebpackPlugin(conf))
  })

  return r
})()

module.exports = (debug) => {
  // 这里publicPath要使用绝对路径，不然scss/css最终生成的css图片引用路径是错误的，应该是scss-loader的bug
  let publicPath = ''
  //
  let cssLoader
  let sassLoader

  // 没有真正引用也会加载到runtime，如果没安装这些模块会导致报错，有点坑
  plugins.push(
    new webpack.ProvidePlugin({
      $: 'jquery-compat',
      jQuery: 'jquery-compat',
      'window.jQuery': 'jquery-compat'
    })
  )
  plugins.push(
    new webpack.ProvidePlugin({
      Avalon: 'avalon2',
      'window.Avalon': 'avalon2'
    })
  )

  if (debug) {
    var extractCSS = new ExtractTextPlugin('css/[name].css?[contenthash]')
    cssLoader = extractCSS.extract(['css', 'autoprefixer'])
    sassLoader = extractCSS.extract(['css', 'autoprefixer', 'sass'])
    plugins.push(extractCSS, new webpack.HotModuleReplacementPlugin())
  } else {
    var extractCSS = new ExtractTextPlugin('css/[contenthash:8].[name].min.css', {
      // 当allChunks指定为false时，css loader必须指定怎么处理
      // additional chunk所依赖的css，即指定`ExtractTextPlugin.extract()`
      // 第一个参数`notExtractLoader`，一般是使用style-loader
      // @see https://github.com/webpack/extract-text-webpack-plugin
      allChunks: false
    })
    cssLoader = extractCSS.extract(['css?minimize', 'autoprefixer'])
    sassLoader = extractCSS.extract(['css?minimize', 'autoprefixer', 'sass'])

    plugins.push(
      extractCSS,
      new UglifyJsPlugin({
        compress: {
          warnings: false
        },
        output: {
          comments: false
        },
        mangle: {
          except: ['$', 'exports', 'require']
        }
      }),
      // new AssetsPlugin({
      //     filename: path.resolve(assets, 'source-map.json')
      // }),
      new webpack.optimize.DedupePlugin(),
      new webpack.NoErrorsPlugin()
    )

    plugins.push(new UglifyJsPlugin())
  }

  let config = {
    entry: Object.assign(entries, {
      // 用到什么公共lib（例如React.js），就把它加进vender去，目的是将公用库单独提取打包
      'vender': ['jquery-compat', 'avalon2', path.resolve(srcDir, 'base/baseController.js')]
    }),

    output: {
      path: assets,
      filename: debug ? 'controller/[name].js' : 'controller/[chunkhash:8].[name].min.js',
      chunkFilename: debug ? 'controller/[chunkhash:8].chunk.js' : 'controller/[chunkhash:8].chunk.min.js',
      hotUpdateChunkFilename: debug ? 'controller/[id].js' : 'controller/[id].[chunkhash:8].min.js',
      publicPath: publicPath
    },

    resolve: {
      root: [srcDir, nodeModPath],
      alias: pathMap,
      extensions: ['', '.js', '.css', '.scss', '.tpl', '.png', '.jpg']
    },

    module: {
      loaders: [
        {
          test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
          loaders: [
            // url-loader更好用，小于10KB的图片会自动转成dataUrl，
            // 否则则调用file-loader，参数直接传入
            'url?limit=10000&name=img/[hash:8].[name].[ext]',
            'image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}'
          ]
        },
        {
          test: /\.((ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9]))|(ttf|eot)$/,
          loader: 'url?limit=10000&name=fonts/[hash:8].[name].[ext]'
        },
        { test: /\.swf$/, loader: 'file' },
        { test: /\.(tpl|ejs)$/, loader: 'ejs' },
        { test: /\.css$/, loader: cssLoader },
        { test: /\.scss$/, loader: sassLoader },
        {
          test: /\.js$/,
          loader: 'babel',
          exclude: /node_modules/
        },
        {
          test: /\.json(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url',
          query: {
            name: '[name].[ext]?mimetype=application/json'
          }
        }
      ]
    },
    babel: {
      presets: ['es2015', 'stage-0'],
      plugins: ['transform-runtime']
    },
    plugins: [
      new CommonsChunkPlugin({
        name: 'vender'
      })
    ].concat(plugins),

    devServer: {
      hot: true,
      noInfo: false,
      inline: true,
      publicPath: publicPath,
      stats: {
        cached: false,
        colors: true
      }
    }
  }

  if (debug) {
    // 为实现webpack-hot-middleware做相关配置
    // @see https://github.com/glenjamin/webpack-hot-middleware
    ((entry) => {
      for (let key of Object.keys(entry)) {
        if (!Array.isArray(entry[key])) {
          entry[key] = Array.of(entry[key])
        }
        entry[key].push('webpack-hot-middleware/client?reload=true')
      }
    })(config.entry)

    config.plugins.push(new webpack.HotModuleReplacementPlugin())
    config.plugins.push(new webpack.NoErrorsPlugin())
  }

  return config
}

// 引用需要用到的组件
var path = require('path')
var fs = require('fs')
var webpack = require('webpack')
var glob = require('glob')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin

// 源文件所在全路径
var srcDir = path.resolve(__dirname, '../src')
// 打包输出全路径
var assets = path.resolve(__dirname, '../assets')
// 组件所在全路径
var nodeModPath = path.resolve(__dirname, '../node_modules')
// 视图所属文件夹
var viewPath = path.resolve(srcDir, 'view')
// 不知道怎么描述
var pathMap = require('../src/pathmap.json')
// View 文件所处路径
var htmlPath = glob.sync(viewPath + '/**/*.html')
// controller 文件所处路径
var controllerPath = path.resolve(srcDir, 'controller/')
// style 文件所处路径
var stylePath = path.resolve(srcDir, 'style/')

// 顶层样式
var baseStyle = path.resolve(srcDir, 'style/baseStyle.scss')
// 顶层控制
var baseController = path.resolve(srcDir, 'controller/baseController.js')

// 获取所有需要打包的JS文件
var entries = {}

// 自动生成入口文件，入口js名必须和入口文件名相同
// 例如，a页的入口文件是a.html，那么在js目录下必须有一个a.js作为入口文件
var plugins = (function () {
  let r = []
  htmlPath.forEach((filePath) => {
    let pathIndex = path.resolve(filePath).indexOf(viewPath) + viewPath.length + 1
    let pathName = filePath.substring(pathIndex)
    let filename = pathName.substring(0, pathName.lastIndexOf('.'))
    let conf = {
      template: 'html!' + filePath,
      filename: filename + '.html'
    }
    conf.inject = 'body'
    conf.chunks = []
    // controller 文件所处路径
    var jsPath = path.resolve(controllerPath, filename + '.js')
    // style 文件所处路径
    var scssPath = path.resolve(stylePath, filename + '.scss')
    if (fs.existsSync(jsPath)) {
      entries[filename] = [jsPath]
      conf.chunks = ['vender', filename]
    }
    if (fs.existsSync(scssPath)) {
      if (Array.isArray(entries[filename])) {
        entries[filename].push(baseStyle)
        entries[filename].push(scssPath)
      } else {
        entries[filename] = [baseStyle, scssPath]
        conf.chunks = [filename]
      }
    }
    r.push(new HtmlWebpackPlugin(conf))
  })

  return r
})()

module.exports = (debug) => {
  // 这里publicPath要使用绝对路径，不然scss/css最终生成的css图片引用路径是错误的，应该是scss-loader的bug
  let publicPath = '/'
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
      'vender': ['jquery-compat', 'avalon2', baseController]
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
          test: /\.(jpe?g|png|gif|ico)$/,
          loaders: 'file?name=img/[hash:8].[name].[ext]'
        },
        {
          test: /\.((ttf|eot|woff2?|svg)(\?.*))|(ttf|eot|woff2?|svg)$/,
          loader: 'url?limit=10000&name=fonts/[hash:8].[name].[ext]'
        },
        { test: /\.swf$/, loader: 'file?name=swf/[hash:8].[name].[ext]' },
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
            name: 'json/[name].[ext]?mimetype=application/json'
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

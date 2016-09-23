var express = require('express')
var open = require('open')
var util = require('util')

var app = express()
var port = 3000

var webpack = require('webpack'),
  webpackDevMiddleware = require('webpack-dev-middleware'),
  webpackHotMiddleware = require('webpack-hot-middleware'),
  webpackDevConfig = require('../config/webpack-dev.config')

var compiler = webpack(webpackDevConfig)

app.use(webpackDevMiddleware(compiler, webpackDevConfig.devServer))
app.use(webpackHotMiddleware(compiler))

app.listen(port)

// 打开浏览器
let url = util.format('http://%s:%d', 'localhost', port)
open(url)
gulp = require 'gulp'
gutil = require 'gulp-util'
plumber = require 'gulp-plumber'
rename = require 'gulp-rename'
source = require 'vinyl-source-stream'
webpack = require 'webpack'
ExtractTextPlugin = require 'extract-text-webpack-plugin'


gulp.task 'default', [
  'copy'
  'webpack'
]

gulp.task 'copy', ->
  gulp
    .src ['package.json']
    .pipe gulp.dest 'dist'
  # gulp
  #   .src ['node_modules/font-awesome/fonts/*'], base: 'node_modules/font-awesome'
  #   .pipe gulp.dest 'dist'

gulp.task 'webpack', ->
  webpack
    entry:
      main: './src/main/main.coffee'
      renderer: './src/renderer/index.coffee'
    output:
      path: './dist'
      filename: '[name].js'
    module:
      loaders: [
        test: /\.coffee$/
        loader: 'coffee-loader'
      ,
        # test: /\.(css)(\?.+)$/,
        test: /\.(css)$/,
        # loaders: ['style-loader', 'css-loader']
        loader: 'css-loader'
      ,
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        # loader: "url-loader?limit=10000&minetype=application/font-woff"
        loader: "url-loader?minetype=application/font-woff"
      ,
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      #   test: /\.(woff|woff2)(\?.+)$/,
      #   loader: 'file-loader?limit=8192'
      # ,
      #   test: /\.(otf|eot|svg|ttf|woff|woff2)(\?.+)$/,
      #   loader: 'file-loader?limit=8192'
      ]
    # plugins: [
    #   new ExtractTextPlugin 'bundle.css'
    # ]
    resolve:
      extensions: [
        ''
        '.js'
        '.coffee'
      ]
    externals: [
      do ->
        IGNORE = [
          # Node
          'fs'
          # Electron
          'crash-reporter'
          'app'
          'menu'
          'menu-item'
          'browser-window'
          'dialog'
          # Module
          'chokidar'
        ]
        (context, request, callback) ->
          return callback null, "require('#{request}')" if request in IGNORE
          callback()
    ]
    stats:
      colors: true
  , (err, stats) ->
    throw new gutil.PluginError 'webpack', err if err?
    gutil.log '[webpack]', stats.toString()

gulp.task 'package', ->

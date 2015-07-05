gulp = require 'gulp'
gutil = require 'gulp-util'
plumber = require 'gulp-plumber'
webpack = require 'webpack'
packager = require 'electron-packager'
{readFileSync, writeFileSync, existsSync, mkdirSync} = require 'fs'
{cloneDeep} = require 'lodash'


pkg = JSON.parse readFileSync 'package.json'


gulp.task 'default', [
  'ready'
  'copy'
  'webpack'
]

gulp.task 'ready', ->
  if !existsSync 'dist'
    mkdirSync 'dist'
  p = cloneDeep pkg
  p.dependencies = chokidar: pkg.dependencies.chokidar
  delete p.devDependencies
  writeFileSync 'dist/package.json', JSON.stringify p

gulp.task 'copy', ->
  gulp
    .src ['./node_modules/chokidar/**/*'], base: '.'
    .pipe gulp.dest 'dist'

gulp.task 'webpack', ->
  w = ({entry, output}, cb) ->
    webpack
      entry: entry
      output:
        filename: output
      module:
        loaders: [
          test: /\.coffee$/
          loader: 'coffee-loader'
        ,
          test: /\.(css)$/,
          loader: 'css-loader'
        ,
          test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "url-loader?minetype=application/font-woff"
        ,
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "file-loader"
        ]
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
      cb?()
  w
    entry: './src/renderer/index.coffee'
    output: './tmp/renderer.js'
  , (err) ->
    w
      entry: './src/main/main.coffee'
      output: './dist/main.js'

gulp.task 'package', ->
  packager
    dir: 'dist'
    name: pkg.name
    platform: 'all'
    arch: 'all'
    version: '0.29.1'
    overwrite: true
  ,  (err, appPath) ->
    throw new gutil.PluginError 'package', err if err?
    console.log appPath

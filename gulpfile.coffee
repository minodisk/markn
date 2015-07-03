gulp = require 'gulp'
gutil = require 'gulp-util'
plumber = require 'gulp-plumber'
rename = require 'gulp-rename'
source = require 'vinyl-source-stream'
webpack = require 'webpack'


gulp.task 'default', [
  'copy'
  'webpack'
]

gulp.task 'copy', ->
  gulp
    .src ['node_modules/font-awesome/fonts/*'], base: 'node_modules/font-awesome'
    .pipe gulp.dest 'dist'

gulp.task 'webpack', ->
  webpack
    entry:
      main: './src/main/main.coffee'
      renderer: './src/renderer/index.coffee'
    output:
      filename: './dist/[name].js'
    module:
      loaders: [
        test: /\.coffee$/
        loader: 'coffee-loader'
      ,
      #   test: /font-awesome\.css$/
      #   loader: 'raw-loader'
      # ,
        test: /\.css$/
        loader: 'css-loader'
        # test: /\.(eot|woff2?|ttf|svg)$/
        # test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/
        # test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/
        # loader: 'url-loader'
        # loader: "url-loader?limit=10000&minetype=application/font-woff"
      # ,
      #   test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/
      #   loader: "file-loader"
      #   test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/
      #   loader: "url-loader?limit=10000&minetype=application/font-woff&name=dist/[sha512:hash:base64:7].[ext]"
      # ,
      #   test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/
      #   loader: "file-loader?name=dist/[sha512:hash:base64:7].[ext]"
      # }
      ]
    # plugins: [
    #   new webpack.IgnorePlugin /\.(ttf|eot|svg|woff2?)(\?v=[0-9]\.[0-9]\.[0-9])?$/
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

# gulp.task 'browserify', ->
#   [
#     input: 'src/main/main.coffee'
#     output: 'main.js'
#     bundleExternal: false
#   ,
#     input: 'src/renderer/index.coffee'
#     output: 'renderer.js'
#     bundleExternal: true
#   ].forEach ({input, output, bundleExternal}) ->
#     browserify input,
#         bundleExternal: bundleExternal
#         transform: ['coffeeify']
#         extensions: ['.coffee']
#         debug: true
#       .transform stringify ['.html', '.css'],
#         removeComments: false
#         collapseWhitespace: false
#       # .transform require 'browserify-css'
#       .bundle()
#       .pipe plumber()
#       .pipe source output
#       .pipe gulp.dest 'dist'

gulp.task 'package', ->

# {readFile, writeFile} = require 'fs'
#
# readFile 'node_modules/github-markdown-css/github-markdown.css', 'utf8', (err, data) ->
#   throw err if err?
#   writeFile 'github-markdown.css', data.replace(/\.octicon/g, '.icon'), (err) ->
#     throw err if err?
#     console.log 'done converting css'

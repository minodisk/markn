gulp = require 'gulp'
gutil = require 'gulp-util'
plumber = require 'gulp-plumber'
webpack = require 'webpack'
{join, dirname, basename, extname, relative, resolve} = require 'path'
{readFileSync, writeFileSync, mkdir} = require 'fs'
packager = require 'electron-packager'
GitHub = require 'github'
{spawn} = require 'child_process'
Q = require 'q'
{argv} = require 'yargs'
semver = require 'semver'
# electron = require('electron-connect').server.create path: 'dist'


pkg = JSON.parse readFileSync 'package.json'
url = pkg.repository.url
owner = basename dirname url
repo = basename pkg.repository.url, extname url
[electron] = []
isWatch = false


gulp.task 'default', ->
  # isWatch = true
  gulp.start 'debug'

gulp.task 'debug', ['build'], ->
  gulp.start 'electron'
  # gulp.watch ['dist/**/*'], ->
  #   electron.kill 0
  #   gulp.start 'electron'

gulp.task 'electron', ->
  electron = spawn '../node_modules/electron-prebuilt/dist/Electron.app/Contents/MacOS/Electron', ['.'],
    cwd: 'dist'
  electron.stdout.on 'data', (data) -> console.log data.toString 'utf-8'
  electron.stderr.on 'data', (data) -> console.log data.toString 'utf-8'
  electron.on 'close', (code) -> console.log 'Electron done'

gulp.task 'build', [
  'copy'
  'webpack'
]

gulp.task 'copy', ->
  gulp
    .src ['package.json', 'node_modules/chokidar/**/*'], base: '.'
    .pipe gulp.dest 'dist'

gulp.task 'webpack', ->
  w = ({entry, output}, cb) ->
    webpack
      watch: isWatch
      entry: entry
      output:
        filename: output
      module:
        loaders: [
          test: /\.coffee$/
          loader: 'coffee'
        ,
          test: /\.jade$/
          loader: 'jade'
        ,
          test: /\.css$/
          loader: 'css'
        ,
          test: /\.styl$/
          loader: 'css!stylus'
        ,
          test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/
          loader: 'url?minetype=application/font-woff'
        ,
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/
          loader: 'file'
        ,
          test: /\.md$/
          loader: 'raw-loader'
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
            'shell'
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

gulp.task 'publish', ['default'], ->
  Q
    .when ''

    .then ->
      d = Q.defer()
      mkdir 'dist', d.resolve
      d.promise

    .then ->
      releases = ['major', 'minor', 'patch']
      release = argv.r
      unless release in releases
        release = 'patch'
      version = semver.inc pkg.version, release
      pkg.version = version
      json = JSON.stringify pkg, null, 2
      [
        'package.json'
        'dist/package.json'
      ].forEach (p) -> writeFileSync p, json
    .then ->
      console.log 'bump package.json'

    .then ->
      d = Q.defer()
      console.log "git commit package.json"
      git = spawn 'git', ['commit', '-m', "Bump version to v#{pkg.version}", 'package.json']
      git.stdout.on 'data', (data) -> console.log data.toString 'utf8'
      git.stderr.on 'data', (data) -> console.log data.toString 'utf8'
      git.on 'close', (code) -> d.resolve()
      d.promise

    .then ->
      d = Q.defer()
      console.log "git push"
      git = spawn 'git', ['push']
      git.stdout.on 'data', (data) -> console.log data.toString 'utf8'
      git.stderr.on 'data', (data) -> console.log data.toString 'utf8'
      git.on 'close', (code) -> d.resolve()
      d.promise

    .then ->
      d = Q.defer()
      packager
        dir: 'dist'
        name: pkg.name
        platform: 'all'
        arch: 'all'
        version: '0.29.1'
        overwrite: true
      ,  (err, dirs) ->
        d.reject err if err?
        d.resolve dirs
      d.promise

    .then (dirs) ->
      dirs = dirs.map (dir) ->
        name = basename dir
        zip = "#{name}.zip"
        {dir, name, zip}

      github = new GitHub
        version: "3.0.0"
        debug: true
      github.authenticate
        type: 'oauth'
        token: process.env.TOKEN

      Q
        .all dirs.map ({name, zip}) ->
          d = Q.defer()
          console.log "zip #{name} to #{zip}"
          zip = spawn 'zip', [zip, '-r', name]
          zip.stdout.on 'data', (data) -> console.log data.toString 'utf8'
          zip.stderr.on 'data', (data) -> console.log data.toString 'utf8'
          zip.on 'close', (code) -> d.resolve()
          d.promise

        .then ->
          d = Q.defer()
          console.log 'create new release'
          github.releases.createRelease
            owner: owner
            repo: repo
            tag_name: "v#{pkg.version}"
          , (err, res) ->
            d.reject err if err?
            console.log JSON.stringify res, null, 2
            d.resolve res.id
          d.promise

        .then (id) ->
          console.log "complete to create new release: #{id}"

          Q
            .all dirs.map ({zip}) ->
              d = Q.defer()
              github.releases.uploadAsset
                owner: owner
                repo: repo
                id: id
                name: zip
                filePath: zip
              , (err, res) ->
                d.reject err if err?
                console.log JSON.stringify res, null, 2
                d.resolve()
              d.promise
            .then ->
              console.log 'complete to upload'

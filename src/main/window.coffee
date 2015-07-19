EventEmitter = require 'events'
{readFile} = require 'fs'
{join} = require 'path'
{watch} = require 'chokidar'

BrowserWindow = require 'browser-window'
{showOpenDialog} = require 'dialog'
shell = require 'shell'

mediator = require './mediator'
events = require './events'
Storage = require './storage'
{bindTarget} = require './util'
jade = require './index.jade'
js = require 'raw!../../tmp/renderer.js'
readMe = require '../../README.md'
githubCSS = require '../../node_modules/github-markdown-css/github-markdown.css'
fontAwesomeCSS = require '../../node_modules/font-awesome/css/font-awesome.css'
patchCSS = require './patch.styl'


module.exports =
class Window extends EventEmitter

  constructor: ->
    super
    @storage = new Storage
    @storage.get 'bounds', (err, bounds) =>
      if err?
        bounds = width: 800, height: 600
      @browserWindow = new BrowserWindow bounds
      @browserWindow.webContents.on 'did-finish-load', @onContentsDidFinishLoad
      @browserWindow.webContents.on 'will-navigate', @onContentsWillNavigate
      @browserWindow.on 'move', @onMoved
      @browserWindow.on 'resize', @onResized
      @browserWindow.on 'close', @onClose
      html = jade
        styles: [githubCSS, fontAwesomeCSS, patchCSS]
        scripts: [js]
      base64 = new Buffer(html).toString 'base64'
      @browserWindow.loadUrl "data:text/html;base64,#{base64}"
      mediator.on events.OPEN_FILE, @onOpenFileRequested
      mediator.on events.TOGGLE_DEVTOOLS, @onToggleDevToolsRequested
      mediator.on events.FIND, @onFindRequested
      mediator.on events.RELOAD, @onReloadRequested

  destruct: ->
    @browserWindow.removeAllListeners()
    mediator.removeListener events.OPEN_FILE, @onOpenFileRequested
    mediator.removeListener events.TOGGLE_DEVTOOLS, @onToggleDevToolsRequested
    mediator.removeListener events.RELOAD, @onReloadRequested

  close: -> @browserWindow.close()

  onContentsDidFinishLoad: =>
    @browserWindow.setTitle 'README.md'
    @render readMe

  onContentsWillNavigate: (e, url) =>
    e.preventDefault()
    shell.openExternal url

  onMoved: => @registerBounds()

  onResized: => @registerBounds()

  onClose: =>
    @destruct()
    @emit 'close', {currentTarget: @}

  onOpenFileRequested: =>
    return unless @browserWindow.isFocused()
    showOpenDialog
      properties: ['openFile']
    , (filenames) =>
      return unless filenames?[0]?
      @filename = filenames[0]
      @start @filename

  onToggleDevToolsRequested: =>
    return unless @browserWindow.isFocused()
    @browserWindow.toggleDevTools()

  onFindRequested: => @browserWindow.webContents.send 'call', 'find'

  onReloadRequested: =>
    return unless @browserWindow.isFocused() and @filename?
    @render ''
    @start @filename

  registerBounds: ->
    @storage.set 'bounds', @browserWindow.getBounds(), (err) =>
      throw err if err?

  start: (filename) ->
    if @watcher?
      @watcher.removeAllListeners()
      @watcher.close()
    @watcher = watch filename
    @watcher.on 'change', @onFileChanged
    @browserWindow.setTitle filename
    @load filename

  onFileChanged: (filename) => @load filename

  load: (filename) ->
    readFile filename, 'utf8', (err, data) =>
      throw err if err?
      @render data

  render: (md) ->
    @browserWindow.webContents.send 'call', 'render', md

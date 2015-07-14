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
html = require 'url-loader?mimetype=text/html!./index.html'
js = require 'raw-loader!../../tmp/renderer.js'
readMe = require 'raw-loader!../../README.md'


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
      @browserWindow.on 'closed', @onClosed
      @browserWindow.loadUrl html
      mediator.on events.OPEN_FILE, @onOpenFileRequested
      mediator.on events.TOGGLE_DEVTOOLS, @onToggleDevToolsRequested
      mediator.on events.RELOAD, @onReloadRequested

  destruct: ->
    @browserWindow.removeAllListeners()
    mediator.removeListener events.OPEN_FILE, @onOpenFileRequested
    mediator.removeListener events.TOGGLE_DEVTOOLS, @onToggleDevToolsRequested
    mediator.removeListener events.RELOAD, @onReloadRequested

  onContentsDidFinishLoad: =>
    @browserWindow.webContents.executeJavaScript js
    @browserWindow.setTitle 'README.md'
    @render readMe

  onContentsWillNavigate: (e, url) =>
    e.preventDefault()
    shell.openExternal url

  onMoved: => @registerBounds()

  onResized: => @registerBounds()

  onClosed: =>
    @destruct()
    @emit 'closed', {currentTarget: @}

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

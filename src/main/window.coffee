EventEmitter = require 'events'
{readFile} = require 'fs'
{join} = require 'path'
BrowserWindow = require 'browser-window'
{showOpenDialog} = require 'dialog'
{watch} = require 'chokidar'

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
      @start filenames[0]

  onToggleDevToolsRequested: =>
    return unless @browserWindow.isFocused()
    @browserWindow.toggleDevTools()

  onReloadRequested: =>
    return unless @browserWindow.isFocused()
    @browserWindow.reload()

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

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
      @browserWindow.loadUrl ""
      mediator.on events.OPEN_FILE, @onOpenFileRequested
      mediator.on events.TOGGLE_DEVTOOLS, @onToggleDevToolsRequested
      mediator.on events.RELOAD, @onReloadRequested

  destruct: ->
    @browserWindow.removeAllListeners()
    mediator.removeListener events.OPEN_FILE, @onOpenFileRequested
    mediator.removeListener events.TOGGLE_DEVTOOLS, @onToggleDevToolsRequested
    mediator.removeListener events.RELOAD, @onReloadRequested

  onContentsDidFinishLoad: =>
    readFile 'dist/renderer.js', 'utf8', (err, data) =>
      throw err if err
      @browserWindow.webContents.executeJavaScript data
      @start 'README.md'

  onMoved: => @registerBounds()

  onResized: => @registerBounds()

  onClosed: =>
    @destruct()
    @emit 'closed', {currentTarget: @}

  onOpenFileRequested: =>
    return unless @browserWindow.isFocused()
    showOpenDialog
      properties: ['openFile']
    , ([filename]) =>
      @start filename

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
    @render filename

  onFileChanged: (filename) => @render filename

  render: (filename) ->
    readFile filename, 'utf8', (err, data) =>
      throw err if err?
      @browserWindow.webContents.send 'call', 'render', data

reporter = require('crash-reporter').start()
app = require 'app'
BrowserWindow = require 'browser-window'
Storage = require './storage'

extendEvent = (cb) ->
  (e) ->
    e.currentTarget = @
    cb e

class Main

  constructor: ->
    @storage = new Storage
    @windows = []

    app.on 'ready', @onReady
    app.on 'window-all-closed', @onWindowAllClosed
    app.on 'quit', @onQuit

  onReady: (e) =>
    @newWindow()

  newWindow: ->
    @storage.get 'bounds', (err, bounds) =>
      if err?
        bounds = width: 800, height: 600
      w = new BrowserWindow bounds
      w.on 'move', extendEvent @onWindowMoved
      w.on 'resize', extendEvent @onWindowResized
      w.loadUrl 'file://' + __dirname + '/index.html'
      @windows.push w

  onWindowMoved: (e) => @registerBounds e.currentTarget

  onWindowResized: (e) => @registerBounds e.currentTarget

  onWindowAllClosed: (e) =>
    console.log 'onWindowAllClosed'
    if process.platform != 'darwin'
      app.quit()

  onQuit: (e) =>
    log.Println('onQuit')
    # process.exit()

  registerBounds: (w) ->
    @storage.set 'bounds', w.getBounds(), (err) ->
      if err?
        console.error err
        return

new Main

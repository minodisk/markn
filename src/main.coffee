app = require 'app'
BrowserWindow = require 'browser-window'
reporter = require 'crash-reporter'

class Main

  constructor: ->
    reporter.start()

    app.on 'ready', @onReady
    app.on 'window-all-closed', @onWindowAllClosed
    app.on 'quit', @onQuit

  onReady: (e) =>
    console.log 'onReady'

    win = new BrowserWindow width: 800, height: 600
    win.loadUrl 'file://' + __dirname + '/index.html'

  onWindowAllClosed: (e) =>
    console.log 'onWindowAllClosed'
    if process.platform != 'darwin'
      app.quit()

  onQuit: (e) =>
    log.Println('onQuit')
    # process.exit()

new Main

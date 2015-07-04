require('crash-reporter').start()
app = require 'app'
{writeFileSync, readFileSync} = require 'fs'

mediator = require './mediator'
events = require './events'
Menu = require './menu'
Window = require './window'


class Main

  constructor: ->
    @windows = []

    app.on 'ready', @onReady
    app.on 'window-all-closed', @onWindowAllClosed
    app.on 'quit', @onQuit

    mediator.on events.OPEN_NEW_WINDOW, @onOpenNewWindowRequested

  onReady: =>
    @menu = new Menu
    @openNewWindow()

  onWindowAllClosed: =>
    if process.platform != 'darwin'
      app.quit()

  onQuit: =>
    console.log 'onQuit'

  onOpenNewWindowRequested: => @openNewWindow()

  onQuitRequested: => app.quit()

  openNewWindow: ->
    window = new Window
    window.on 'closed', @onWindowClosed
    @windows.push window

  onWindowClosed: (e) =>
    window = e.currentTarget
    window.removeAllListeners()
    @windows.splice @windows.indexOf(window), 1


new Main

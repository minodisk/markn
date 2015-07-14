require('crash-reporter').start()
app = require 'app'
dialog = require 'dialog'
shell = require 'shell'
{writeFileSync, readFileSync} = require 'fs'

mediator = require './mediator'
events = require './events'
Menu = require './menu'
Window = require './window'


class Main

  VERSION: app.getVersion()

  constructor: ->
    @windows = []

    app.on 'ready', @onReady
    app.on 'window-all-closed', @onWindowAllClosed
    app.on 'quit', @onQuit

    mediator.on events.OPEN_NEW_WINDOW, @onOpenNewWindowRequested
    mediator.on events.QUIT, @onQuitRequested
    mediator.on events.OPEN_ABOUT_DIALOG, @onOpenAboutDialogRequested
    mediator.on events.OPEN_HELP, @onOpenHelpRequested

  onReady: =>
    @menu = new Menu
    @openNewWindow()

  onWindowAllClosed: =>
    if process.platform != 'darwin'
      app.quit()

  onQuit: =>
    console.log 'onQuit'

  onOpenNewWindowRequested: => @openNewWindow()

  onQuitRequested: => @quit()

  onOpenAboutDialogRequested: => @openAboutDialog()

  onOpenHelpRequested: => @openHelp()

  openNewWindow: ->
    window = new Window
    window.on 'closed', @onWindowClosed
    @windows.push window

  quit: -> app.quit()

  openAboutDialog: ->
    dialog.showMessageBox
      type: 'info' # String - Can be "none", "info" or "warning"
      buttons: ['ok'] # Array - Array of texts for buttons
      title: 'About Markn' # String - Title of the message box, some platforms will not show it
      message: 'Markn' # String - Content of the message box
      detail: """
      Lightweight markdown viewer
      v#{@VERSION}
      """ # String - Extra information of the message
      # icon NativeImage

  openHelp: -> shell.openExternal "https://github.com/minodisk/markn/blob/v#{@VERSION}/README.md#readme"

  onWindowClosed: (e) =>
    window = e.currentTarget
    window.removeAllListeners()
    @windows.splice @windows.indexOf(window), 1


new Main

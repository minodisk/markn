Menu = require 'menu'
Item = require 'menu-item'

mediator = require './mediator'
events = require './events'


module.exports = class

  constructor: ->
    Menu.setApplicationMenu Menu.buildFromTemplate if Menu.sendActionToFirstResponder?
      [
        label: 'Markn'
        submenu: [
          label: 'About Markn'
          click: -> mediator.emit events.OPEN_ABOUT_DIALOG
        ,
          type: 'separator'
        ,
          label: 'Hide Electron'
          accelerator: 'CommandOrControl+H'
          selector: 'hide:'
        ,
          label: 'Hide Others'
          accelerator: 'CommandOrControl+Shift+H'
          selector: 'hideOtherApplications:'
        ,
          label: 'Show All'
          selector: 'unhideAllApplications:'
        ,
          type: 'separator'
        ,
          label: 'Quit'
          accelerator: 'CommandOrControl+Q'
          selector: 'terminate:'
        ]
      ,
        label: 'File'
        submenu: [
          label: 'New Window'
          accelerator: 'CommandOrControl+N'
          click: -> mediator.emit events.OPEN_NEW_WINDOW
        ,
          label: 'Open File'
          accelerator: 'CommandOrControl+O'
          click: -> mediator.emit events.OPEN_FILE
        ]
      ,
        label: 'Edit'
        submenu: [
        #   label: 'Undo'
        #   accelerator: 'CommandOrControl+Z'
        #   selector: 'undo:'
        # ,
        #   label: 'Redo'
        #   accelerator: 'Shift+CommandOrControl+Z'
        #   selector: 'redo:'
        # ,
        #   type: 'separator'
        # ,
          label: 'Cut'
          accelerator: 'CommandOrControl+X'
          selector: 'cut:'
        ,
          label: 'Copy'
          accelerator: 'CommandOrControl+C'
          selector: 'copy:'
        ,
          label: 'Paste'
          accelerator: 'CommandOrControl+V'
          selector: 'paste:'
        ,
          label: 'Select All'
          accelerator: 'CommandOrControl+A'
          selector: 'selectAll:'
        ]
      ,
        label: 'View'
        submenu: [
          label: 'Reload'
          accelerator: 'CommandOrControl+R'
          click: -> mediator.emit events.RELOAD
        ,
          label: 'Toggle DevTools'
          accelerator: 'Alt+CommandOrControl+I'
          click: -> mediator.emit events.TOGGLE_DEVTOOLS
        ]
      ,
        label: 'Window'
        submenu: [
          label: 'Minimize'
          accelerator: 'CommandOrControl+M'
          selector: 'performMiniaturize:'
        ,
          label: 'Close'
          accelerator: 'CommandOrControl+W'
          selector: 'performClose:'
        ,
          type: 'separator'
        ,
          label: 'Bring All to Front'
          selector: 'arrangeInFront:'
        ]
      ,
        label: 'Help'
        submenu: [
          label: 'Markn Help'
          click: -> mediator.emit events.OPEN_HELP
        ]
      ]
    else
      [
        label: 'File'
        submenu: [
          label: 'New Window'
          accelerator: 'CommandOrControl+N'
          click: -> mediator.emit events.OPEN_NEW_WINDOW
        ,
          label: 'Open File'
          accelerator: 'CommandOrControl+O'
          click: -> mediator.emit events.OPEN_FILE
        ,
          type: 'separator'
        ,
          label: 'Exit'
          accelerator: 'CommandOrControl+Q'
          click: -> mediator.emit events.QUIT
        ]
      ,
        label: 'Help'
        submenu: [
          label: 'About Markn'
          click: -> mediator.emit events.OPEN_ABOUT_DIALOG
        ]
      ]

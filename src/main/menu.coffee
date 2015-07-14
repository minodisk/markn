Menu = require 'menu'
Item = require 'menu-item'

mediator = require './mediator'
events = require './events'


module.exports = class

  constructor: ->
    Menu.setApplicationMenu Menu.buildFromTemplate [
      label: 'Markn'
      submenu: [
        label: 'About Electron'
        selector: 'orderFrontStandardAboutPanel:'
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
        label: 'Undo'
        accelerator: 'CommandOrControl+Z'
        selector: 'undo:'
      ,
        label: 'Redo'
        accelerator: 'Shift+CommandOrControl+Z'
        selector: 'redo:'
      ,
        type: 'separator'
      ,
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
      submenu: []
    ]

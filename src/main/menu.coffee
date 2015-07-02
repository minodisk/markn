mediator = require './mediator'
events = require './events'
Menu = require 'menu'
Item = require 'menu-item'


module.exports = class

  constructor: ->
    Menu.setApplicationMenu Menu.buildFromTemplate [
      label: 'Electron'
      submenu: [
        label: 'About Electron'
        selector: 'orderFrontStandardAboutPanel:'
      ,
        type: 'separator'
      ,
        label: 'Services'
        submenu: []
      ,
        type: 'separator'
      ,
        label: 'Hide Electron'
        accelerator: 'Command+H'
        selector: 'hide:'
      ,
        label: 'Hide Others'
        accelerator: 'Command+Shift+H'
        selector: 'hideOtherApplications:'
      ,
        label: 'Show All'
        selector: 'unhideAllApplications:'
      ,
        type: 'separator'
      ,
        label: 'Quit'
        accelerator: 'Command+Q'
        selector: 'terminate:'
      ]
    ,
      label: 'File'
      submenu: [
        label: 'New Window'
        accelerator: 'Command+N'
        click: -> mediator.emit events.OPEN_NEW_WINDOW
      ,
        label: 'Open File'
        accelerator: 'Command+O'
        click: -> mediator.emit events.OPEN_FILE
      ]
    ,
      label: 'Edit'
      submenu: [
        label: 'Undo'
        accelerator: 'Command+Z'
        selector: 'undo:'
      ,
        label: 'Redo'
        accelerator: 'Shift+Command+Z'
        selector: 'redo:'
      ,
        type: 'separator'
      ,
        label: 'Cut'
        accelerator: 'Command+X'
        selector: 'cut:'
      ,
        label: 'Copy'
        accelerator: 'Command+C'
        selector: 'copy:'
      ,
        label: 'Paste'
        accelerator: 'Command+V'
        selector: 'paste:'
      ,
        label: 'Select All'
        accelerator: 'Command+A'
        selector: 'selectAll:'
      ]
    ,
      label: 'View'
      submenu: [
        label: 'Reload'
        accelerator: 'Command+R'
        click: -> mediator.emit events.RELOAD
      ,
        label: 'Toggle DevTools'
        accelerator: 'Alt+Command+I'
        click: -> mediator.emit events.TOGGLE_DEVTOOLS
      ]
    ,
      label: 'Window'
      submenu: [
        label: 'Minimize'
        accelerator: 'Command+M'
        selector: 'performMiniaturize:'
      ,
        label: 'Close'
        accelerator: 'Command+W'
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

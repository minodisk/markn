remote = require 'remote'
app = remote.require 'app'
Menu = remote.require 'menu'
dialog = remote.require 'dialog'
fs = remote.require 'fs'
{update} = require './renderer'
{watch} = require 'chokidar'

class Index

  constructor: ->
    new M()

class M

  constructor: ->
    console.log 'set up menu'
    Menu.setApplicationMenu Menu.buildFromTemplate @template()

  template: ->
    [
      submenu: [
        label: 'Quit',
        accelerator: 'Command+Q',
        click: @onQuitClicked
      ]
    ,
      label: 'File',
      submenu: [
        label: 'Open',
        accelerator: 'Command+O',
        click: @onFileOpenClicked
      ]
    ,
      label: 'Display',
      submenu: [
        label: 'Open Dev Tools',
        accelerator: 'Command+Alt+I',
        click: ->
          remote.getCurrentWindow().openDevTools()
      ]
    ]

  onQuitClicked: (e) =>
    app.quit()

  onFileOpenClicked: (e) =>
    dialog.showOpenDialog
      properties: ['openFile']
    , ([filename]) =>
      if @w?
        @w.removeAllListeners()
        @w.close()
      @w = watch filename
      @w.on 'change', @render
      @render filename

  render: (filename) ->
    fs.readFile filename, 'utf8', (err, data) ->
      return if err?
      update data

new Index

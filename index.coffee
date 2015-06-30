remote = require('remote')
app = remote.require('app')
Menu = remote.require('menu')
MenuItem = remote.require('menu-item')
dialog = remote.require('dialog')
Watcher = remote.require('./watcher')
window.React = require 'react'
md2react = require 'md2react'
$ = React.createElement

class Index
  constructor: ->
    new M()

class M
  constructor: ->
    @w = new Watcher()
    @w.on 'error', @onWatcherError
    @w.on 'change', @onWatcherChanged

    @el = $ Renderer, {}
    React.render @el, document.body

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
    , ([file]) =>
      @w.watch(file)

  onWatcherError: (err) =>
    console.log 'onWatcherError'
    console.error err

  onWatcherChanged: (data) =>
    console.log 'onWatcherChanged'
    @render data

  render: (md) ->
    # React.renderToString md2react md
    console.log 'render:'
    console.log md2react md
    @el.setState content: md2react md

Renderer = React.createClass

  getInitialState: ->
    console.log 'getInitialState'
    content: "foooo"

  componentDidMout: ->
    console.log 'componentDidMount'

  render: ->
    console.log 'render'
    $ 'div', {}, if @state.content? then [@state.content] else ''

new Index()

ipc = require 'ipc'
window.React = {createClass, createElement: $, render} = require 'react'
md2react = require '../md2react/lib/index'


class App

  constructor: ->
    ipc.on 'call', @onCall
    document.addEventListener 'DOMContentLoaded', @onDomContentLoaded

  onDomContentLoaded: =>
    document.removeEventListener 'DOMContentLoaded', @onDomContentLoaded
    @markdown = render $(Markdown, {}), document.body

  onCall: (method, args...) =>
      fn = @[method]
      console.log method
      throw new Error "App.#{method} is undefined" unless fn?
      console.log fn
      fn.apply @, args

  render: (data) -> @markdown.update data


createMdElement = (md) ->
  md2react md,
    # gfm:true
    # breaks: true
    # tables: true

    # position: true
    # gfm: true
    # yaml: true
    # commonmark: true
    # footnotes: true
    # pedantic: true
    # breaks: true

    gfm: true
    breaks: true
    tables: true
    commonmark: true
    footnotes: true


Markdown = createClass

  render: ->
    $ 'div', {className: 'markdown-body'}, [@state.content]

  getInitialState: ->
    content: null

  update: (md) ->
    @setState content: createMdElement md


new App

ipc = window.require 'ipc'
window.React = {createClass, createElement: $, render} = require 'react'
# md2react = require '../../../md2react/lib/index'
md2react = require '../../node_modules/md2react/lib/index'


class App

  constructor: ->
    @$search = document.querySelector '.search-box'
    document.querySelector '.search-box .button-close'
      .addEventListener 'click', @closeSearchBox
    @markdown = render $(Markdown, {}), document.querySelector '.markdown-body'
    ipc.on 'call', @onCall

  onCall: (method, args...) =>
    fn = @[method]
    throw new Error "App.#{method} is undefined" unless fn?
    fn.apply @, args

  render: (data) -> @markdown.update data

  find: => @$search.style.transform = 'translateY(31px)'

  closeSearchBox: => @$search.style.transform = ''


createMdElement = (md) ->
  md2react md,
    gfm: true
    breaks: true
    tables: true
    commonmark: true
    footnotes: true

Markdown = createClass

  render: -> $ 'div', null, [@state.content]

  getInitialState: -> content: null

  update: (md) -> @setState content: createMdElement md


new App

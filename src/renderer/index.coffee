ipc = window.require 'ipc'
window.React = {createClass, createElement: $, render} = require 'react'
# md2react = require '../../../md2react/lib/index'
md2react = require '../../node_modules/md2react/lib/index'
githubCSS = require '../../node_modules/github-markdown-css/github-markdown.css'
fontAwesomeCSS = require '../../node_modules/font-awesome/css/font-awesome.css'
patchCSS = require './patch.css'


class App

  constructor: ->
    [
      githubCSS
      fontAwesomeCSS
      patchCSS
    ].forEach (css) ->
      style = document.createElement 'style'
      style.textContent = css
      document.head.appendChild style

    @markdown = render $(Markdown, {}), document.querySelector '.markdown-body'
    ipc.on 'call', @onCall

  onCall: (method, args...) =>
    fn = @[method]
    throw new Error "App.#{method} is undefined" unless fn?
    fn.apply @, args

  render: (data) -> @markdown.update data


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

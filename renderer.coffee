window.React = {createClass, createElement: $, render} = require 'react'
md2react = require 'md2react'

createMdElement = (md) ->
  md2react md,
    gfm:true
    breaks: true
    tables: true

Markdown = createClass

  render: ->
    $ 'div', {className: 'markdown-body'}, [@state.content]

  getInitialState: ->
    content: null

  update: (md) ->
    @setState content: createMdElement md

module.exports = render $(Markdown, {}), document.body

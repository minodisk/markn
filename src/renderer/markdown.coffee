{createClass, createElement: $} = require 'react'
md2react = require 'imports?React=react!../../node_modules/md2react/lib/index'


module.exports = createClass

  getInitialState: -> content: null

  update: (md) ->
    el = md2react md,
      gfm: true
      breaks: true
      tables: true
      commonmark: true
      footnotes: true
    @setState content: el

  render: -> $ 'div', null, [@state.content]

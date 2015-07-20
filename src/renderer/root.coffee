{createClass, createElement: $} = require 'react'

Search = require './search'
Markdown = require './markdown'


module.exports = createClass

  render: ->
    $ 'div', className: 'root',  [
      $ Search, {}
      $ Markdown, {}
    ]

{createClass, createElement: $} = require 'react'


module.exports = createClass

  getInitialState: ->
    index: ''
    isShown: false

  update: (index) -> @setState index: '1/11'

  show: -> @setState isShown: true

  hide: -> @setState isShown: false

  render: ->
    console.log 'render', @state
    $ 'div', className: [
      'search-box'
      if @state.isShow then 'is-shown' else null
    ], [
      $ 'div', className: 'search', [
        $ 'input', type: 'text'
        $ 'span', className: 'index', [@state.index]
      ]
      $ 'button', className: ['fa', 'fa-chevron-up', 'button-up']
      $ 'button', className: ['fa', 'fa-chevron-down', 'button-up']
      $ 'button', className: ['fa', 'fa-times', 'button-close']
    ]

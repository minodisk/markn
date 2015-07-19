ipc = window.require 'ipc'
{createElement: $, render} = require 'react'

Markdown = require './markdown'


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

  find: => @$search.classList.add 'is-shown'

  closeSearchBox: => @$search.classList.remove 'is-shown'


new App

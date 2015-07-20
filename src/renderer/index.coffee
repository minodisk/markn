ipc = window.require 'ipc'
{createElement: $, render} = require 'react'

EventEmitter = require 'events'
ActionCreator = require './ActionCreator'
Root = require './root'


class App

  constructor: ->
    @dispatcher = new EventEmitter
    @action = new ActionCreator @dispatcher
    render $(Root, {}), document.body
    ipc.on 'call', @onCall

  onCall: (method, args...) =>
    fn = @[method]
    throw new Error "App.#{method} is undefined" unless fn?
    fn.apply @, args

  render: (data) -> # @markdown.update data

  find: => # @search.show() # @$search.classList.add 'is-shown'

  closeSearchBox: => # @search.hide() # @$search.classList.remove 'is-shown'


new App

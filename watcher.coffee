EventEmitter = require 'events'
fs = require 'fs'
{basename} = require 'path'

module.exports =
class Watcher extends EventEmitter

  watch: (filename) ->
    @close()
    console.log 'watch:', filename
    @w = fs.watch filename, (e, f) =>
      console.log 'watche change'
      fs.readFile filename, 'utf8', (err, data) =>
        console.log err, data
        if err?
          @emit 'error', err
          return
        @emit 'change', data

  close: ->
    return unless @w?
    @w.close()
    delete @w

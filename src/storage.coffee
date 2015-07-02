app = require 'app'
{join} = require 'path'
{readFile, writeFile} = require 'fs'
{stringify, parse} = JSON

module.exports =
class Storage

  constructor: ->
    @dataDir = app.getPath 'userData'

  get: (key, cb) ->
    readFile @path(key), 'utf8', (err, data) ->
      if err?
        cb err
        return
      cb null, parse data

  set: (key, val, cb) ->
    writeFile @path(key), stringify(val), (err) ->
      cb err

  path: (key) -> join @dataDir, key

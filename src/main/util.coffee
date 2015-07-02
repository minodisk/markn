module.exports =

  bindTarget: (cb) -> (e) ->
    e.currentTarget = @
    cb e

{readFile, writeFile} = require 'fs'

readFile 'node_modules/github-markdown-css/github-markdown.css', 'utf8', (err, data) ->
  throw err if err?
  writeFile 'github-markdown.css', data.replace(/\.octicon/g, '.icon'), (err) ->
    throw err if err?
    console.log 'done converting css'

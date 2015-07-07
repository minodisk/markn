# Markn

Lightweight markdown viewer

## Features

- Only viewer. We have the liberty to choose editor.
- Possible to render huge markdown file.
- Re-render only changed nodes.

## Components

Consists of awesome modules.

- [atom/electron](https://github.com/atom/electron) based application.
- Render HTML with [facebook/react](https://github.com/facebook/react).
- Generate react elements from AST with [mizchi/md2react](https://github.com/mizchi/md2react).
  - Generate AST from markdown with [wooorm/mdast](https://github.com/wooorm/mdast).
- Watch file with [paulmillr/chokidar](https://github.com/paulmillr/chokidar).
- Style with [sindresorhus/github-markdown-css](https://github.com/sindresorhus/github-markdown-css).

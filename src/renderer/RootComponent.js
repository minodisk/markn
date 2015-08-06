import React from 'react'
import Search from './SearchComponent'
import Markdown from './MarkdownComponent'

let $ = React.createElement;

export default class RootComponent extends React.Component {
  render() {
    return $('div', {className: 'root'},  [
      $(Search, {}),
      $(Markdown, {})
    ]);
  }
}

'use strict';

import React from 'react'
import Search from './SearchComponent'
import Markdown from './MarkdownComponent'

var $ = React.createElement;

export default class RootComponent extends React.Component {
  render() {
    return $('div', {className: 'root'},  [
      $(Search, {}),
      $(Markdown, {})
    ]);
  }
}

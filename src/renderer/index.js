import githubCSS from '../../node_modules/github-markdown-css/github-markdown.css'
// import fontAwesomeCSS from '../../node_modules/font-awesome/css/font-awesome.css'
import patchCSS from './patch.styl'

import React from 'react'
import RootComponent from './RootComponent'

var $ = React.createElement;

export default class App {
  constructor() {
    React.render($(RootComponent, {}), document.body);
  }
}


new App();

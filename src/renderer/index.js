import React from 'react'
import RootComponent from './RootComponent'

var $ = React.createElement;

export default class App {
  constructor() {
    React.render($(RootComponent, {}), document.body);
  }
}

new App();

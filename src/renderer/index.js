'use strict';

// import IPC from './IPC'
import React from 'react'
import RootComponent from './RootComponent'

var $ = React.createElement;

export default class App {
  constructor() {
    // this.ipc = new IPC();
    React.render($(RootComponent, {}), document.body);
  }
}


new App();

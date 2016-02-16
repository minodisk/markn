import React from 'react'
import ReactDOM from 'react-dom'
import RootComponent from './views/root'

var $ = React.createElement

export default class App {
  constructor () {
    ReactDOM.render($(RootComponent, {}), document.querySelector('.js-markn'))
  }
}

window.app = new App()

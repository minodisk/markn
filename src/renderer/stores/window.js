import EventEmitter from 'events'
import dispatcher from '../dispatcher'
import {ipcRenderer} from 'electron'

export default new class WindowStore extends EventEmitter {
  constructor () {
    super()

    window.addEventListener('resize', this.onResized.bind(this))

    ipcRenderer.on('focus', this.onFocus.bind(this))
    ipcRenderer.on('blur', this.onBlur.bind(this))
    ipcRenderer.on('resize', this.onResize.bind(this))

    dispatcher.on('ready', this.onReady.bind(this))
  }

  onFocus (e) {
    this.emit('focus')
  }

  onBlur (e) {
    this.emit('blur')
  }

  onReady () {
    this.onFocus()
    this.resize()
  }

  onResize (e, size) {
    this.resize()
  }

  onResized () {
    this.resize()
  }

  resize () {
    this.emit('resize', {x: window.innerWidth, y: window.innerHeight})
  }
}

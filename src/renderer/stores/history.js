import EventEmitter from 'events'
import dispatcher from '../dispatcher'
import {ipcRenderer} from 'electron'

export default new class HistoryStore extends EventEmitter {
  constructor () {
    super()
    this.pathes = []
    this.index = -1

    ipcRenderer.on('file-changed', this.onFileChanged.bind(this))
    ipcRenderer.on('history-backwarded', this.onHistoryBackwarded.bind(this))
    ipcRenderer.on('history-forwarded', this.onHistoryForwarded.bind(this))
    dispatcher.on('history-backwarding', this.backward.bind(this))
    dispatcher.on('history-forwarding', this.forward.bind(this))
  }

  onFileChanged (e, file) {
    if (file.path === this.pathes[this.pathes.length - 1]) {
      return
    }

    this.pathes.splice(this.index + 1)

    this.pathes.push(file.path)
    this.index = this.pathes.length - 1
    this.emitState()
  }

  emitState () {
    this.emit('state-change', {
      canBackward: this.canBackward(),
      canForward: this.canForward()
    })
  }

  canBackward () {
    return this.index > 0
  }

  canForward () {
    return this.index < (this.pathes.length - 1)
  }

  backward () {
    if (!this.canBackward()) return
    let path = this.pathes[this.index - 1]
    console.log('backward:', path)
    // this.emit('backward', path)
    ipcRenderer.send('history-backwarding', path)
  }

  forward () {
    if (!this.canForward()) return
    let path = this.pathes[this.index + 1]
    console.log('forward:', path)
    // this.emit('forward', path)
    ipcRenderer.send('history-forwarding', path)
  }

  onHistoryBackwarded (e, file) {
    console.log('onHistoryBackwarded:', file.path)
    this.index--
    this.emitState()
    this.emit('backwarded', file)
  }

  onHistoryForwarded (e, file) {
    console.log('onHistoryForwarded:', file.path)
    this.index++
    this.emitState()
    this.emit('forwarded', file)
  }
}

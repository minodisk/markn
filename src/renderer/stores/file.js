import EventEmitter from 'events'
import {ipcRenderer} from 'electron'

export default new class FileStore extends EventEmitter {
  constructor () {
    super()
    ipcRenderer.on('file-changed', this.onFileChanged.bind(this))
    ipcRenderer.on('file-updated', this.onFileUpdated.bind(this))
  }

  onFileChanged (e, file) {
    this.emit('changed', file)
  }

  onFileUpdated (e, file) {
    this.emit('updated', file)
  }
}

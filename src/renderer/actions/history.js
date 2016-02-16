import {ipcRenderer} from 'electron'
import dispatcher from '../dispatcher'

export default new class HistoryAction {
  backward () {
    dispatcher.emit('history-backwarding')
  }

  forward () {
    dispatcher.emit('history-forwarding')
  }

  reload () {
    ipcRenderer.send('file-reloading')
  }

  change (path) {
    ipcRenderer.send('file-changing', path)
  }
}

import EventEmitter from 'events'
import dispatcher from '../dispatcher'
import ipc from 'ipc'

export default new class FileStore extends EventEmitter {
  constructor() {
    super();

    dispatcher.on('file-reloading', this.onReloading.bind(this));
    dispatcher.on('file-changing', this.onChanging.bind(this));
    ipc.on('file-changed', this.onChanged.bind(this));
  }

  onReloading() {
    ipc.send('file-reloading');
  }

  onChanging(path) {
    ipc.send('file-changing', path);
  }

  onChanged(file) {
    this.emit('change', file);
  }
}

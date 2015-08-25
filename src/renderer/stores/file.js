import EventEmitter from 'events'
import ipc from 'ipc'
import dispatcher from '../dispatcher'

export default new class FileStore extends EventEmitter {
  constructor() {
    super();
    ipc.on('file-changed', this.onChanged.bind(this));
  }

  onChanged(file) {
    this.emit('change', file);
  }
}

import EventEmitter from 'events'
import ipc from 'ipc'
import dispatcher from './Dispatcher'

export default class SearchStore extends EventEmitter {
  constructor() {
    super();
    ipc.on('openFind', this.onOpenFind.bind(this));
    dispatcher.on('closeFind', this.onCloseFind.bind(this));
  }

  onOpenFind() {
    this.emit('openFind');
  }

  onCloseFind() {
    this.emit('closeFind');
  }
}

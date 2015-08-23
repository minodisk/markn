import EventEmitter from 'events'
import ipc from 'ipc'
import dispatcher from './Dispatcher'

export default new class NavStore extends EventEmitter {
  constructor() {
    super();
  }
}

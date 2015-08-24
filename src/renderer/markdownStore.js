import EventEmitter from 'events'
import ipc from 'ipc'
import dispatcher from './Dispatcher'

export default new class MarkdownStore extends EventEmitter {
  constructor() {
    super();

    // ipc.on('render', this.onRender.bind(this));
    dispatcher.on('searching', this.onSearching.bind(this));
  }

  // onRender(md, filename) {
  //   this.emit('updating', md, filename);
  // }

  onSearching(word) {
    this.emit('searching', word);
  }
}

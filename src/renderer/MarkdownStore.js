import EventEmitter from 'events'
import ipc from 'ipc'
import dispatcher from './Dispatcher'

export default class MarkdownStore extends EventEmitter {
  constructor() {
    super();

    this.md = this.dirname = this.search = '';

    ipc.on('render', this.onRender.bind(this));
    dispatcher.on('search', this.onSearch.bind(this));
  }

  onRender(md, dirname) {
    this.md = md;
    this.dirname = dirname;
    this.emitUpdate();
  }

  onSearch(text) {
    this.search = text;
    this.emitUpdate();
  }

  emitUpdate() {
    this.emit('update', this.md, this.dirname, this.search);
  }
}

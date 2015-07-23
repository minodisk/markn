'use strict';

import EventEmitter from 'events'
import ipc from 'ipc'
import dispatcher from './Dispatcher'

export default class MarkdownStore extends EventEmitter {
  constructor() {
    super();
    ipc.on('render', this.onRender.bind(this));
    dispatcher.on('search', this.onSearch.bind(this));
  }

  onRender(data) {
    this.emit('change', data);
  }

  onSearch(text) {
    this.emit('search', text);
  }
}

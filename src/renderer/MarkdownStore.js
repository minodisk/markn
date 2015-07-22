'use strict';

import EventEmitter from 'events'
// import dispatcher from './Dispatcher'
import ipc from 'ipc'

export default class MarkdownStore extends EventEmitter {
  constructor() {
    super();
    ipc.on('render', this.onRender.bind(this));
  }

  onRender(data) {
    this.emit('change', data);
  }
}

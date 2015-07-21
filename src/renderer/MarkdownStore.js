'use strict';

import EventEmitter from 'events'
import dispatcher from './Dispatcher'

export default class MarkdownStore extends EventEmitter {
  constructor() {
    super();
    dispatcher.on('render', this.onRender.bind(this));
  }

  onRender(data) {
    this.emit('change', data);
  }
}

'use strict';

import EventEmitter from 'events'
import dispatcher from './Dispatcher'

export default class SearchStore extends EventEmitter {
  constructor() {
    super();
    dispatcher.on('openFind', this.onOpenFind.bind(this));
  }

  onOpenFind() {
    this.emit('openFind');
  }
}

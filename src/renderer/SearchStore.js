'use strict';

import EventEmitter from 'events'
// import dispatcher from './Dispatcher'
import ipc from 'ipc'

export default class SearchStore extends EventEmitter {
  constructor() {
    super();
    ipc.on('openFind', this.onOpenFind.bind(this));
    ipc.on('closeFind', this.onCloseFind.bind(this));
  }

  onOpenFind() {
    this.emit('openFind');
  }

  onCloseFind() {
    this.emit('closeFind');
  }
}

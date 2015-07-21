'use strict';

import ipc from 'ipc'
import dispatcher from './Dispatcher'

export default class IPC {
  constructor() {
    this.actionCreator = new ActionCreator();
    ipc.on('call', this.onCall.bind(this));
  }

  onCall(method, ...args) {
    var fn = this[method];
    if (fn == undefined) {
      throw new Error("App.#{method} is undefined");
    }
    fn.apply(this, args)
  }

  render(data) {
    this.actionCreator.render(data);
  }

  find() {
    this.actionCreator.openFind();
  }
}

class ActionCreator {
  render(data) {
    dispatcher.emit('render', data);
  }

  openFind() {
    dispatcher.emit('openFind');
  }
}

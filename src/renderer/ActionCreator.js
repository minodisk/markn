"use strict";

export default class ActionCreator {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }

  countUp(data) {
    this.dispatcher.emit("countUp", data);
  }
}

import EventEmitter from 'events'
import ipc from 'ipc'
import dispatcher from './Dispatcher'

export default class SearchStore extends EventEmitter {
  constructor() {
    super();

    this.focusedIndex = 0;
    this.marks = [];

    ipc.on('openFind', this.onOpenFind.bind(this));
    dispatcher.on('closeFind', this.onCloseFind.bind(this));
    dispatcher.on('update-marks', this.updateMarks.bind(this));
    dispatcher.on('next-mark', this.nextMark.bind(this));
  }

  onOpenFind() {
    this.emit('openFind');
  }

  onCloseFind() {
    this.emit('closeFind');
  }

  updateMarks(marks) {
    this.marks = marks;

    if (this.marks.length === 0) {
      this.emit('updateDisable', true);
    } else {
      this.emit('updateDisable', false);
    }
  }

  nextMark() {
    let len = this.marks.length;
    if (len === 0) {
      return;
    }

    this.focusedIndex++;
    if (this.focuedIndex >= len) {
      this.focusedIndex = 0;
    }

    let mark = this.marks[this.focusedIndex];
    let rect = mark.getBoundingClientRect();
  }
}

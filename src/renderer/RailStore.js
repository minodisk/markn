import EventEmitter from 'events'
import dispatcher from './Dispatcher'

export default class RailStore extends EventEmitter {
  constructor() {
    super();

    dispatcher.on('update-marks', this.updateMarks.bind(this));
  }

  updateMarks(marks) {
    this.emit('update', marks);
  }
}

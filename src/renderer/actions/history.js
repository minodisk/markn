import dispatcher from '../dispatcher'

export default new class HistoryAction {
  backward() {
    dispatcher.emit('backward');
  }

  forward() {
    dispatcher.emit('forward');
  }

  reload() {
    dispatcher.emit('file-reloading');
  }

  change(path) {
    dispatcher.emit('file-changing', path);
  }
}

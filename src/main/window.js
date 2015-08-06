import EventEmitter from 'events'
import {readFile} from 'fs'
import {join} from 'path'
import {watch} from 'chokidar'
import BrowserWindow from 'browser-window'
import {showOpenDialog} from 'dialog'
import shell from 'shell'
import mediator from './mediator'
import events from './events'
import Storage from './storage'
import {bindTarget} from './util'

export default class Window extends EventEmitter {
  constructor(filename) {
    super();

    this.filename = filename;
    this.onFileChanged = this.onFileChanged.bind(this);
    this.onReloadRequested = this.onReloadRequested.bind(this);
    this.onFindRequested = this.onFindRequested.bind(this);
    this.onToggleDevToolsRequested = this.onToggleDevToolsRequested.bind(this);
    this.onOpenFileRequested = this.onOpenFileRequested.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onResized = this.onResized.bind(this);
    this.onMoved = this.onMoved.bind(this);
    this.onContentsWillNavigate = this.onContentsWillNavigate.bind(this);
    this.onContentsDidFinishLoad = this.onContentsDidFinishLoad.bind(this);

    this.storage = new Storage;
    this.storage.get('bounds', (err, bounds) => {
      if (err != null) {
        bounds = {
          width: 800,
          height: 600
        }
      }
      this.browserWindow = new BrowserWindow(bounds);
      this.browserWindow.webContents.on('did-finish-load', this.onContentsDidFinishLoad);
      this.browserWindow.webContents.on('will-navigate', this.onContentsWillNavigate);
      this.browserWindow.on('move', this.onMoved);
      this.browserWindow.on('resize', this.onResized);
      this.browserWindow.on('close', this.onClose);
      this.browserWindow.loadUrl(`file://${__dirname}/index.html`);
      mediator.on(events.OPEN_FILE, this.onOpenFileRequested);
      mediator.on(events.TOGGLE_DEVTOOLS, this.onToggleDevToolsRequested);
      mediator.on(events.FIND, this.onFindRequested);
      mediator.on(events.RELOAD, this.onReloadRequested);
    });
  }

  destruct() {
    this.browserWindow.removeAllListeners();
    mediator.removeListener(events.OPEN_FILE, this.onOpenFileRequested);
    mediator.removeListener(events.TOGGLE_DEVTOOLS, this.onToggleDevToolsRequested);
    mediator.removeListener(events.RELOAD, this.onReloadRequested);
  }

  close() {
    this.browserWindow.close();
  }

  onContentsDidFinishLoad() {
    this.start();
  }

  onContentsWillNavigate(e, url) {
    console.log(url);
    // e.preventDefault();
    // shell.openExternal(url);
  }

  onMoved() {
    this.registerBounds();
  }

  onResized() {
    this.registerBounds();
  }

  onClose() {
    this.destruct();
    this.emit('close', {
      currentTarget: this
    });
  }

  onOpenFileRequested() {
    if (!this.browserWindow.isFocused()) {
      return;
    }
    showOpenDialog({
      properties: ['openFile']
    }, (filenames) => {
      if (!filenames || !filenames[0]) {
        return;
      }
      this.start(filenames[0]);
    });
  }

  onToggleDevToolsRequested() {
    if (!this.browserWindow.isFocused()) {
      return;
    }
    this.browserWindow.toggleDevTools();
  }

  onFindRequested() {
    if (!this.browserWindow.isFocused()) {
      return;
    }
    this.browserWindow.webContents.send('openFind');
  }

  onReloadRequested() {
    if (!(this.browserWindow.isFocused() && (this.filename != null))) {
      return;
    }
    this.render('');
    this.start();
  }

  registerBounds() {
    this.storage.set('bounds', this.browserWindow.getBounds(), (err) => {
        if (err != null) {
          throw err;
        }
    });
  }

  start(filename) {
    if (filename) {
      this.filename = filename;
    }

    if (this.watcher != null) {
      this.watcher.removeAllListeners();
      this.watcher.close();
    }
    this.watcher = watch(this.filename);
    this.watcher.on('change', this.onFileChanged);
    this.browserWindow.setTitle(this.filename);
    this.load(this.filename);
  }

  onFileChanged(filename) {
    this.load(filename);
  }

  load(filename) {
    readFile(filename, 'utf8', (err, data) => {
      if (err != null) {
        throw err;
      }
      this.render(data);
    });
  }

  render(md) {
    this.browserWindow.webContents.send('render', md);
  }
}

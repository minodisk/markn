import EventEmitter from 'events'
import {readFile} from 'fs'
import {join} from 'path'
import {watch} from 'chokidar'
import BrowserWindow from 'browser-window'
import showOpenDialog from 'dialog'
import shell from 'shell'
import mediator from './mediator'
import events from './events'
import Storage from './storage'
import {bindTarget} from './util'
import jade from './index.jade'
import js from 'raw!../../tmp/renderer.js'
import readMe from '../../README.md'
import githubCSS from '../../node_modules/github-markdown-css/github-markdown.css'
import fontAwesomeCSS from '../../node_modules/font-awesome/css/font-awesome.css'
import patchCSS from './patch.styl'

export default class Window extends EventEmitter {
  constructor() {
    super()
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
        var base64, html;
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
        html = jade({
          styles: [githubCSS, fontAwesomeCSS, patchCSS],
          scripts: [js]
        });
        base64 = new Buffer(html).toString('base64');
        this.browserWindow.loadUrl("data:text/html;base64," + base64);
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
    this.browserWindow.setTitle('README.md');
    this.render(readMe);
  }

  onContentsWillNavigate(e, url) {
    e.preventDefault();
    shell.openExternal(url);
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
        if ((filenames != null ? filenames[0] : void 0) == null) {
          return;
        }
        this.filename = filenames[0];
        this.start(this.filename);
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
    this.start(this.filename);
  }

  registerBounds() {
    this.storage.set('bounds', this.browserWindow.getBounds(), (err) => {
        if (err != null) {
          throw err;
        }
    });
  }

  start(filename) {
    if (this.watcher != null) {
      this.watcher.removeAllListeners();
      this.watcher.close();
    }
    this.watcher = watch(filename);
    this.watcher.on('change', this.onFileChanged);
    this.browserWindow.setTitle(filename);
    this.load(filename);
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

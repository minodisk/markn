import EventEmitter from 'events'
import fs from 'fs'
import {join, extname, dirname, normalize} from 'path'
import {watch} from 'chokidar'
import BrowserWindow from 'browser-window'
import {showOpenDialog} from 'dialog'
import shell from 'shell'
import mediator from './mediator'
import events from './events'
import Storage from './storage'
import {bindTarget} from './util'
import ipc from 'ipc'
import polyfill from 'babel/polyfill'

const URL = 'file://' + join(__dirname, '..', 'index.html');
const EXTENSIONS = [
  '.markdown',
  '.mdown',
  '.mkdn',
  '.md',
  '.mkd',
  '.mdwn',
  '.mdtxt',
  '.mdtext',
  '.text',
];

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

export default class Window extends EventEmitter {

  static add(window) {
    if (!this.windows) this.windows = [];
    this.windows.push(window);
  }

  static remove(window) {
    this.windows.splice(this.windows.indexOf(window), 1);
  }

  static closeAllWindows() {
    this.windows.forEach((window) => window.close());
  }

  constructor(filename) {
    super();

    Window.add(this);

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
      if (err) {
        bounds = {
          width: 800,
          height: 600
        };
      }
      this.browserWindow = new BrowserWindow(bounds);
      this.browserWindow.webContents.on('did-finish-load', this.onContentsDidFinishLoad);
      this.browserWindow.webContents.on('will-navigate', this.onContentsWillNavigate);
      this.browserWindow.on('focus', this.onFocus.bind(this));
      this.browserWindow.on('blur', this.onBlur.bind(this));
      this.browserWindow.on('move', this.onMoved);
      this.browserWindow.on('resize', this.onResized);
      this.browserWindow.on('close', this.onClose);
      this.browserWindow.loadUrl(URL);
      this.setTitle();

      mediator.on(events.OPEN_FILE, this.onOpenFileRequested);
      mediator.on(events.TOGGLE_DEVTOOLS, this.onToggleDevToolsRequested);
      mediator.on(events.FIND, this.onFindRequested);
      mediator.on(events.RELOAD, this.onReloadRequested);
      ipc.on(events.RELOAD, this.onReloadRequested);
    });
  }

  async setTitle() {
    let pkg = await readFile('package.json');
    let p = JSON.parse(pkg);
    this.browserWindow.setTitle(`${p.appName} v${p.version}`);
  }

  destruct() {
    this.browserWindow.webContents.removeAllListeners();
    this.browserWindow.removeAllListeners();
    mediator.removeListener(events.OPEN_FILE, this.onOpenFileRequested);
    mediator.removeListener(events.TOGGLE_DEVTOOLS, this.onToggleDevToolsRequested);
    mediator.removeListener(events.FIND, this.onFindRequested);
    mediator.removeListener(events.RELOAD, this.onReloadRequested);
  }

  close() {
    this.browserWindow.close();
  }

  onContentsDidFinishLoad() {
    this.start();
  }

  onContentsWillNavigate(e, url) {
    // Renderer file: Reload.
    if (url === URL) {
      return;
    }

    // Prevent navigation in this application.
    e.preventDefault();

    // Markdown file: Render it.
    if (EXTENSIONS.indexOf(extname(url).toLowerCase()) !== -1) {
      url = url.replace(/^file:\/*/, '/');
      this.start(url);
      return;
    }

    // Others: Open external application.
    shell.openExternal(url);
  }

  onFocus() {
    this.browserWindow.webContents.send('focus');
  }

  onBlur() {
    this.browserWindow.webContents.send('blur');
  }

  onMoved() {
    this.registerBounds();
  }

  onResized() {
    this.registerBounds();
    this.browserWindow.webContents.send('resize', this.browserWindow.getSize());
  }

  onClose() {
    console.log('onClose');
    this.destruct();
    this.emit('close', {
      currentTarget: this
    });
    Window.remove(this);
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

  async start(filename) {
    if (filename) {
      this.filename = normalize(filename);
    }

    if (this.watcher != null) {
      this.watcher.removeAllListeners();
      this.watcher.close();
    }

    // Watch only local file.
    if (!(/^https?:\/\//.test(this.filename))) {
      this.watcher = watch(this.filename);
      this.watcher.on('change', this.onFileChanged);
    }

    // this.browserWindow.setTitle(this.filename);
    await this.load(this.filename);
    mediator.emit(events.START_FILE, this.filename);
  }

  onFileChanged(filename) {
    this.load(filename);
  }

  async load(filename) {
    let data = await readFile(filename);
    this.render(data, filename);
  }

  render(md, filename) {
    this.browserWindow.webContents.send('render', md, filename);
  }
}

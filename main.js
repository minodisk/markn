'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var reporter = require('crash-reporter');

class Main {
  constructor() {
    reporter.start();
    console.log('index!!');

    app.on('ready', this.onReady);
    app.on('window-all-closed', this.onWindowAllClosed);
    app.on('quit', this.onQuit);
  }

  onReady(e) {
    console.log('onReady')

    var win = new BrowserWindow({width: 800, height: 600});
    win.loadUrl('file://' + __dirname + '/index.html');
  }

  onWindowAllClosed(e) {
    console.log('onWindowAllClosed')
    if (process.platform != 'darwin') {
      app.quit();
    }
  }

  onQuit(e) {
    log.Println('onQuit')
    // process.exit();
  }
}

new Main();

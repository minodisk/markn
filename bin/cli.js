#! /usr/bin/env node

var path = require('path');

var argv = require('yargs')
.usage('Usage: markn [path]')
.example('markn', 'Run Markn')
.example('markn foo.md', 'Open a markdown file with Markn')
.help('h')
.alias('h', 'help')
.argv;

var spawn = require('child_process').spawn;

var platform = process.platform;
var arch = process.arch;
var app = path.join(__dirname, '../build/Markn-' + platform + '-' + arch + '/');

var command, opts;

switch (platform) {
  case 'darwin':
    app += 'Markn.app';
    command = 'open';
    opts = ['-a',  app,  '-W',  '-n',  '--args'].concat(argv._);
    break;
  case 'linux':
    app += 'Markn';
    command = app;
    opts = argv._;
    break;
  case 'win32':
    app += 'Markn.exe';
    command = app;
    opts = argv._;
    break;
}
console.log(app);

var Markn = spawn(command, opts);
Markn.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});
Markn.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});
Markn.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

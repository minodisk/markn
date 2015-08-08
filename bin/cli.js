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

switch (platform) {
  case 'darwin':
    app += 'Markn.app';
    break;
  case 'linux':
    app += 'Markn';
    break;
  case 'win32':
    app += 'Markn.exe';
    break;
}
console.log(app);

var Markn = spawn('open', ['-a', app, '-W', '-n', '--args'].concat(argv._));
Markn.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});
Markn.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});
Markn.on('close', function (code) {
  console.log('child process exited with code ' + code);
});

#! /usr/bin/env node

var electron = require('electron-prebuilt');
var spawn = require('child_process').spawn;
var argv = require('yargs')
.usage('Usage: markn [path]')
.example('markn', 'Run Markn')
.example('markn foo.md', 'Open a markdown file with Markn')
.help('h')
.alias('h', 'help')
.argv;

spawn(electron, argv[0], {stdio: 'inherit'})

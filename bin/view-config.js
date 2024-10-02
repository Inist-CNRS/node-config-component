#!/usr/bin/env node
'use strict';
const commandLineArgs = require('command-line-args');
const options = commandLineArgs([
  { name: 'trim-depth', alias: 't', type: Number},
  { name: 'inline-depth', alias: 'l', type: Number},
  { name: 'indent', alias: 'i', type: Number},
  { name: 'size', alias: 's', type: Number},

], {
  camelCase: true
});
const configComponent = require('../configComponent');

configComponent.view(options);

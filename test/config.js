'use strict';

const
  configComponent = require('../index.js'),
  should          = require('should'), // jshint ignore:line
  _               = require('lodash')
;
const basicConfig = {
  app     : {
    baseUrl        : 'https://myapp.com',
    rootPath       : '/home/app',
    stackTraceLimit: 10
  },
  security: {
    jwt : {key: 'aFalseKey'},
    ldap: {url: 'https://ldapUrl', pass: 'secretPass'}
  },
  elastic : {clients: {main: {log: ['error', 'trace', 'debug']}}}
};

describe('config#get()', () => {
  it('Should return "config_test" based on env variable "NODE_ENV"', () => {
    const config = configComponent.get();
    config.should.deepEqual(_.clone(basicConfig));
  });
});

'use strict';

const loadSync = require('../loadSync.js'),
      should   = require('should'), // jshint ignore:line
      path     = require('path'),
      _        = require('lodash')
;

const basicConfig = {
  app          : {
    baseUrl        : 'https://myapp.com',
    rootPath       : '/home/app',
    stackTraceLimit: 10
  },
  security     : {
    jwt : {key: 'aFalseKey'},
    ldap: {url: 'https://ldapUrl', pass: 'secretPass'}
  },
  elastic      : {clients: {main: {log: ['error', 'trace', 'debug']}}},
  env: {},
  parameters   : {'TMP_PATH': '/path/to/tmp'}
};

describe('loadSync([file = defaultPath])', () => {
  it('Should load and compile to json yaml file', () => {
    const config         = loadSync(path.join(__dirname, '/config/configBasic.yml')),
          expectedConfig = _.cloneDeep(basicConfig)
    ;

    config.should.deepEqual(expectedConfig);
  });

  it('Should resolve relative imports from file location', () => {
    const config         = loadSync(path.join(__dirname, '/config/configWithRelativeImports.yml')),
          expectedConfig = _.cloneDeep(basicConfig)
    ;
    config.should.deepEqual(expectedConfig);
  });

  it('Imported file should cascade, later property win', () => {
    const config         = loadSync(path.join(__dirname, '/config/configWithCascade.yml')),
          expectedConfig = _.cloneDeep(basicConfig)
    ;

    expectedConfig.parameters.LOG_PATH = '/path/to/log'; // Cascade
    expectedConfig.app.rootPath = '/home/bob/app'; // Cascade
    expectedConfig.app.stackTraceLimit = 50; // Cascade

    config.should.deepEqual(expectedConfig);
  });

  it('Should resolve multiple imports and cascading imports', () => {
    const config         = loadSync(path.join(__dirname, '/config/configWithMultipleImports.yml')),
          expectedConfig = _.cloneDeep(basicConfig)
    ;

    expectedConfig.parameters.LOG_PATH = '/path/to/log'; // Cascade
    expectedConfig.app.rootPath = '/home/bob/app'; // Cascade
    expectedConfig.app.stackTraceLimit = 50; // Cascade

    config.should.deepEqual(expectedConfig);
  });

  it('Should throw on circular imports', () => {
    should.throws(() => {loadSync(path.join(__dirname, '/config/configWithCircularImports.yml'));});
  });

  it('Should throw if "parameters" property is not a plain object', () => {
    should.throws(() => {loadSync(path.join(__dirname, '/config/configWithParametersException.yml'));});
  });

  it('Should throw if "env" property is set', () => {
    should.throws(() => {loadSync(path.join(__dirname, '/config/configWithForbidenProperty.yml'));});
  });
});

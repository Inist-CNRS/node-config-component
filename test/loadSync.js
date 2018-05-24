'use strict';

const loadSync = require('../loadSync.js'),
      should   = require('should'), // jshint ignore:line
      path     = require('path'),
      _        = require('lodash')
;

const basicConfig = {
  app       : {
    name           : 'myApp',
    baseUrl        : 'https://myapp.com',
    rootPath       : '/home/app',
    stackTraceLimit: 10
  },
  security  : {
    jwt : {key: 'aFalseKey'},
    ldap: {url: 'https://ldapUrl', pass: 'secretPass'}
  },
  elastic   : {clients: {main: {log: ['error', 'trace', 'debug']}}},
  env       : {},
  parameters: {'TMP_PATH': '/path/to/tmp'}
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

  it('Should resolve Json and file with no extname relative imports', () => {
    const config         = loadSync(path.join(__dirname, '/config/configWithRelativeJsonImports.yml')),
          expectedConfig = _.cloneDeep(basicConfig)
    ;

    expectedConfig.parameters.ROOT_PATH = expectedConfig.app.rootPath = '/path/to/root'; // Cascade
    expectedConfig.parameters.TMP_PATH = '/path/to/json/tmp'; // Cascade
    expectedConfig.app.stackTraceLimit = 30; // Cascade

    config.should.deepEqual(expectedConfig);
  });

  it('Should resolve cherry picking imports', () => {
    const config         = loadSync(path.join(__dirname, '/config/configWithKeyRelativeJsonImports.yml')),
          expectedConfig = _.cloneDeep(basicConfig)
    ;

    expectedConfig.app.name = 'config-component';
    expectedConfig.app.version = '1.0.0';
    expectedConfig.repository = {type: 'git'};
    expectedConfig.parameters.license = 'MIT';

    config.should.deepEqual(expectedConfig);
  });

  describe('[file = *.js]', () => {
    it('Should import js module that exports litteral Object', () => {
      const config         = loadSync(path.join(__dirname, '/config/configWithJsImports.yml')),
            expectedConfig = _.cloneDeep(basicConfig)
      ;
      expectedConfig.modele = {indice: 'records'};
      expectedConfig.parameters.ROOT = '/root';

      config.should.deepEqual(expectedConfig);
    });

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

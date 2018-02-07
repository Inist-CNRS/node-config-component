'use strict';

const fillPlaceholder = require('../fillPlaceholder.js'),
      should          = require('should'), // jshint ignore:line
      _               = require('lodash')
;

const plainObject = {
  app       : {
    baseUrl        : 'https://%APP_NAME%.com', // sprintf
    rootPath       : '%HOME_PATH%/%APP_NAME%', // sprintf
    stackTraceLimit: '%STACK_TRACE_LIMITE%' // replace with a Number
  },
  elastic   : {
    clients: {
      main  : {log: '%LOG_LEVELS%'}, // replace with an Object
      second: {log: ['error', '%LOG_NAME%']} // replace inside an Array
    }
  },
  parameters: {
    HOME_PATH         : '/home/user',
    APP_NAME          : 'myApp',
    STACK_TRACE_LIMITE: 10,
    LOG_LEVELS        : ['debug', 'stack', 'error'],
    LOG_NAME          : 'debug'
  }
};

const expected = {
        app          : {
          baseUrl        : 'https://myApp.com',
          rootPath       : '/home/user/myApp',
          stackTraceLimit: 10
        },
        elastic      : {
          clients: {
            main  : {log: ['debug', 'stack', 'error']},
            second: {log: ['error', 'debug']}
          }
        },
        parameters   : {
          HOME_PATH         : '/home/user',
          APP_NAME          : 'myApp',
          STACK_TRACE_LIMITE: 10,
          LOG_LEVELS        : ['debug', 'stack', 'error'],
          LOG_NAME          : 'debug'
        },
        env: {}
      }
;

const plainObjectWithEnv = {
  app       : {
    baseUrl        : 'https://%APP_NAME%.com', // sprintf
    rootPath       : '%env(HOME_PATH)%/%APP_NAME%', // sprintf
    stackTraceLimit: '%env(STACK_TRACE_LIMITE)%' // replace with a Number
  },
  elastic   : {
    clients: {
      main  : {log: '%env(LOG_LEVELS)%'}, // replace with an Object
      second: {log: ['error', '%env(LOG_NAME)%']}, // replace inside an Array
      third : '%env(ES_CLIENT_CONF)%'
    }
  },
  parameters: {
    HOME_PATH         : '/home/user',
    APP_NAME          : 'myApp',
    STACK_TRACE_LIMITE: 10,
    LOG_LEVELS        : ['debug', 'stack', 'error'],
    LOG_NAME          : 'debug'
  }
};

const expectedWithEnv = {
  app          : {
    baseUrl        : 'https://myApp.com',
    rootPath       : 'home/path/from/env/myApp',
    stackTraceLimit: 2
  },
  elastic      : {
    clients: {
      main  : {log: ['stack', 'info']},
      second: {log: ['error', 'debug']},
      third : {log: ['debug']}
    }
  },
  parameters   : {
    HOME_PATH         : '/home/user',
    APP_NAME          : 'myApp',
    STACK_TRACE_LIMITE: 10,
    LOG_LEVELS        : ['debug', 'stack', 'error'],
    LOG_NAME          : 'debug'
  },
  env: {
    HOME_PATH         : 'home/path/from/env',
    STACK_TRACE_LIMITE: 2,
    LOG_LEVELS        : ['stack', 'info'],
    LOG_NAME          : 'UNSET',
    ES_CLIENT_CONF    : {log: ['debug']}
  }
};


describe('fillPlaceholder(plainObject)', () => {
  it('Should fill "sprintf" placeholder and replacement placeholder with "parameters"', () => {

    const filledConfig   = fillPlaceholder(plainObject),
          expectedConfig = _.cloneDeep(expected)
    ;

    filledConfig.should.deepEqual(expectedConfig);
  });

  it('Should throw if required placeholder can\'t be found',
     () => {

       should.throws(() => {
         fillPlaceholder(plainObjectWithEnv)
       });

     });

  it('Should fill "sprintf" placeholder and replacement placeholder with "env" or fallback to "parameters"',
     () => {

       _.assign(process.env, {
         HOME_PATH         : 'home/path/from/env',
         STACK_TRACE_LIMITE: '2',
         LOG_LEVELS        : '["stack", "info"]',
         ES_CLIENT_CONF    : '{log: ["debug"]}'
       });

       const filledConfig   = fillPlaceholder(plainObjectWithEnv),
             expectedConfig = _.cloneDeep(expectedWithEnv)
       ;

       filledConfig.should.deepEqual(expectedConfig);
     });
});

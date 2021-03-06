'use strict';

const
    configComponent = require('../index.js'),
    should          = require('should'), // jshint ignore:line
    _               = require('lodash')
;
const basicConfig = {
    app     : {
        name           : 'myApp',
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

describe('config#get(moduleOrPath)', () => {
    it('Should return "config_test" based on env variable "NODE_ENV" and arg === module', () => {
        const config = configComponent.get(module);
        const expectedConfig = _.clone(basicConfig);
        expectedConfig.testConfig = true;

        config.should.deepEqual(expectedConfig);
    });

    it('Should return "config_production" and ignore the env variable "NODE_ENV" if the module is in /node_modules',
            () => {
                const config = require('./data/node_modules/my-module/index.js');

                process.env.NODE_ENV.should.equal('test');
                config.should.deepEqual({
                                            app: {
                                                name: 'my-sub-module',
                                                version        : '0.0.618',
                                                mode: 'production'
                                            }
                                        });
            });

    it('Should return "config_production" and ignore the env variable "NODE_ENV" if the module is in /node_modules/**',
       () => {
           const config = require('./data/node_modules/@foo/my-module/index.js');

           process.env.NODE_ENV.should.equal('test');
           config.should.deepEqual({
                                       app: {
                                           name: 'my-sub-module',
                                           version        : '0.0.618',
                                           mode: 'production'
                                       }
                                   });
       });
});



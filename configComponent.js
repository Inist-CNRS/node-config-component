'use strict';
/**
 * @ref http://docs.ansible.com/ansible/YAMLSyntax.html
 */
const _ = require('lodash');

const
  loadSync        = require('./loadSync'),
  utils           = require('./utils'),
  checkParameters = require('./checkParameters'),
  view            = require('./view'),
  path            = require('path')
;


const configComponent = module.exports;

// get Config dynamically depending on NODE_ENV
configComponent.get = get;

// View prettyfied config depending on NODE_ENV
configComponent.view = view;

// Sync
configComponent.loadSync = _.memoize(loadSync);


function get (_module) {
  let config;
  checkParameters(path.join(utils.resolve(_module.filename), 'secret_parameters.yml'));
  try {
    config = configComponent.loadSync(utils.getEnvPathFrom(_module.filename));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    config = configComponent.loadSync(utils.getDefaultPathFrom(_module.filename));
    console.warn('ConfigComponent: No config found for NODE_ENV=' + utils.getEnv() + ' fallback on config.yml');

  }
  return _.omit(config, ['parameters', 'env']);
}

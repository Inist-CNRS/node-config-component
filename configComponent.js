'use strict';
/**
 * @ref http://docs.ansible.com/ansible/YAMLSyntax.html
 */
const _ = require('lodash');

const
  loadSync              = require('./loadSync'),
  utils                 = require('./utils'),
  checkSecretParameters = _.memoize(require('./checkSecretParameters')),
  view                  = require('./view'),
  path                  = require('path')
;


const configComponent = module.exports;

// get Config dynamically depending on NODE_ENV
configComponent.get = get;

// Same as get but return config metadata too
configComponent._getFullConfig = _getFullConfig;

// View prettyfied config depending on NODE_ENV
configComponent.view = view;

// Sync
configComponent.loadSync = _.memoize(loadSync);


function get (module) {
  return _.omit(configComponent._getFullConfig(module), ['parameters', 'env', 'fileEnv', 'filePath']);
}

function _getFullConfig (module) {

  let config, filePath, fileEnv;
  const secretParamsPath = path.join(utils.resolve(module.filename), 'secret_parameters.yml');

  if (!checkSecretParameters.cache.has(secretParamsPath)) {
    checkSecretParameters(secretParamsPath);
  }

  try {
    filePath = utils.getEnvPathFrom(module.filename);
    fileEnv = utils.getEnv();
    config = configComponent.loadSync(filePath);
  } catch (err) {

    if (err.code !== 'ENOENT' || fileEnv === 'production') {
      // Unexpected Error or production config not found.
      throw err;
    }

    filePath = utils.getProductionPathFrom(module.filename);
    fileEnv = 'production';
    config = configComponent.loadSync(filePath);
    console.warn('ConfigComponent: No config found for NODE_ENV=' + process.env.NODE_ENV + ' fallback on config_production.yml');
  }
  config.filePath = filePath;
  config.fileEnv = fileEnv;

  return config;
}

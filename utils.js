'use strict';
const path   = require('path'),
      _      = require('lodash'),
      moduleConfig = require('./getModuleConfig.js')()
;

const utils  = {};

module.exports = utils;

utils.isNodeEnvSet = isNodeEnvSet;
utils.getEnv = getEnv;
utils.basename = basename;
utils.getPath = getPath;
utils.defaultPath = path.join(moduleConfig.DEFAULT_PATH, moduleConfig.DEFAULT_CONFIG);

function isNodeEnvSet () {
  return !!(process.env.hasOwnProperty('NODE_ENV') && process.env.NODE_ENV.replace(/\s/g, '').length);
}

function basename () {
  if (!isNodeEnvSet()) return moduleConfig.DEFAULT_CONFIG;

  return `config_${getEnv()}.yml`;
}

function getEnv () {
  return _.findKey(
      moduleConfig.envNameMapping,
      (mapping) => {return mapping.includes(process.env.NODE_ENV);}
    ) || process.env.NODE_ENV
    ;
}

function getPath () {
  return path.join(moduleConfig.DEFAULT_PATH, basename());
}

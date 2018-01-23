'use strict';

const yaml = require('yamljs'),
      _    = require('lodash')
;

module.exports = getModuleConfig;

function getModuleConfig () {
  const defaultConfig = yaml.load(__dirname + '/configComponent.yml');
  let userConfig;

  try {
    userConfig = yaml.load('configComponent.yml');

  } catch (err) {
    if (err && err.code === 'ENOENT') return defaultConfig;
    throw err;
  }

  return _.defaultsDeep(userConfig, defaultConfig);
}

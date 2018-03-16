'use strict';

const yaml = require('yamljs'),
      _    = require('lodash')
;

module.exports = getModuleConfig;

function getModuleConfig () {
  return yaml.load(__dirname + '/configComponent.yml');
}

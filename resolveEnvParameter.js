'use strict';

const
  yaml = require('yamljs')
;

module.exports = resolveEnvParameter;


function resolveEnvParameter (envParameterName) {
  if (!process.env.hasOwnProperty(envParameterName)) {
    return;
  }

  return yaml.parse(process.env[envParameterName]);
}

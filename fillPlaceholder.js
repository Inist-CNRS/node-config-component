'use strict';

const resolveEnvParameter = require('./resolveEnvParameter'),
      _                   = require('lodash')
;

const envSyntaxPattern = /^env\((.*)\)$/;

module.exports = fillPlaceholder;


function fillPlaceholder (config) {

  const env = {};
  config = placeholderIterator(config);
  config.env = env;

  return config;

  function placeholderIterator (value, key) {
    let match;

    if (_.isPlainObject(value)) {
      return _.mapValues(value, placeholderIterator);
    }

    if (_.isArray(value)) {
      return value.map(placeholderIterator);
    }

    if (!_.isString(value)) return value;

    // String to value
    if ((match = value.match(/^%([^%]*)%$/))) {
      return resolveParameter(match[1], key);
    }

    // String sprintf style
    if (value.match(/%(.*?)%/)) {
      return value.replace(/%(.*?)%/g,
                           (_match, group) => {
                             return resolveParameter(group, key);
                           });

    }

    // Default
    return value;
  }


  function resolveParameter (parameterName, key) {
    // Use config, env
    let
      envMatch,
      parameters = config.parameters
    ;

    if ((envMatch = parameterName.match(envSyntaxPattern))) {
      parameterName = envMatch[1];
    }

    if (
      (
        envMatch
        && !process.env.hasOwnProperty(parameterName)
        || !envMatch
      )
      && !(parameters && _.has(parameters,parameterName))
    ) {
      throw missingParameterException(parameterName, key);
    }

    if (envMatch && process.env.hasOwnProperty(parameterName)) {
      let resolvedEnvParameter = resolveEnvParameter(parameterName);
      env[parameterName] = resolvedEnvParameter;

      return resolvedEnvParameter;
    }

    if (envMatch) env[parameterName] = 'UNSET';

    return _.get(parameters,parameterName);
  }

}


function missingParameterException (parameterName, key) {
  let err = new Error(`Missing parameter: ${parameterName} for key: ${key}`);
  err.name = 'missingParameterException';
  return err;
}

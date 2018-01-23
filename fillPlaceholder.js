'use strict';

const resolveEnvParameter = require('./resolveEnvParameter'),
      _                   = require('lodash')
;

const envSyntaxPattern = /^env\((.*)\)$/;

module.exports = fillPlaceholder;


function fillPlaceholder (config) {

  const envParameters = {};
  config = placeholderIterator(config);
  config.envParameters = envParameters;

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
    // Use config, envParameters
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
      && !(parameters && parameters.hasOwnProperty(parameterName))
    ) {
      throw missingParameterException(parameterName, key);
    }

    if (envMatch && process.env.hasOwnProperty(parameterName)) {
      let resolvedEnvParameter = resolveEnvParameter(parameterName);
      envParameters[parameterName] = resolvedEnvParameter;

      return resolvedEnvParameter;
    }

    if (envMatch) envParameters[parameterName] = 'UNSET';

    return parameters[parameterName];
  }

}


function missingParameterException (parameterName, key) {
  let err = new Error(`Missing parameter: ${parameterName} for key: ${key}`);
  err.name = 'missingParameterException';
  return err;
}

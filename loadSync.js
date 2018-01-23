'use strict';

const
  yaml  = require('yamljs'),
  _     = require('lodash'),
  utils = require('./utils'),
  path  = require('path')
;

const fillPlaceholder = require('./fillPlaceholder')
;

module.exports = loadSync;

function loadSync (file = utils.defaultPath) {
  let config;

  const
    defaultConfig   = {},
    resolvedImports = []
  ;

  config = resolveYamlImportSync(file);
  config = fillPlaceholder(config || {});

  return config;

  function resolveYamlImportSync (yamlFile)/* use (resolvedImports, defaultConfig)*/ {
    let json,
        dirname = path.dirname(yamlFile)
    ;

    resolvedImports.push(yamlFile);

    json = yaml.load(yamlFile) || defaultConfig;

    if (json.hasOwnProperty('parameters') && !_.isPlainObject(json.parameters)) {
      throw typeException(json.parameters);
    }
    if (json.hasOwnProperty('envParameters')) {
      throw forbidenPropertyException('envParameters');
    }

    if (!json.imports) {
      resolvedImports.pop();
      return json;
    }

    let results = json.imports.map(
      (jsonImport) => {
        let resource = path.isAbsolute(jsonImport.resource) ?
          jsonImport.resource :
          path.join(dirname, jsonImport.resource)
        ;

        if (resolvedImports.includes(resource)) {
          throw importCircularReferenceException(resource, yamlFile);
        }

        return resolveYamlImportSync(resource);
      }
    );
    results.reverse().unshift(json);

    json =
      _(_.spread(_.defaultsDeep)(results))
        .omit('imports')
        .value();
    resolvedImports.pop();
    return json;
  }
}


function importCircularReferenceException (importedYamlFile, yamlFile) {
  let err = new Error(`Circular reference detected importing ${importedYamlFile} in ${yamlFile}`);
  err.name = 'importCircularReferenceException';
  return err;
}

function typeException (parameters) {
  let err = new Error(`parameters must be a litteral object, it is presently: ${typeof parameters}`);
  err.name = 'typeException';
  return err;
}

function forbidenPropertyException (property) {
  let err = new Error(`this property is forbiden: ${property}`);
  err.name = 'forbidenPropertyException';
  return err;
}

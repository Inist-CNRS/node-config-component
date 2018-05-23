'use strict';

const
  yaml  = require('yamljs'),
  _     = require('lodash'),
  utils = require('./utils'),
  path  = require('path'),
  fs    = require('fs-extra')
;

const fillPlaceholder = require('./fillPlaceholder')
;

module.exports = loadSync;

function loadSync (file = utils.defaultPath) {
  let config;

  const
    resolvedImports = []
  ;

  config = resolveYamlImportSync(file);
  config = fillPlaceholder(config || {});

  if (config.hasOwnProperty('parameters') && !_.isPlainObject(config.parameters)) {
    throw typeException(config.parameters);
  }

  return config;

  function resolveYamlImportSync (yamlFile)/* use (resolvedImports)*/ {
    let json,
        dirname = path.dirname(yamlFile)
    ;

    json = _import(yamlFile) || {};
    resolvedImports.push(yamlFile);


    if (json.hasOwnProperty('parameters') && !_.isPlainObject(json.parameters)) {
      throw typeException(json.parameters);
    }
    if (json.hasOwnProperty('env')) {
      throw forbidenPropertyException('env');
    }

    if (!json.imports) {
      resolvedImports.pop();
      return json;
    }

    let results = json.imports.map(
      (jsonImport) => {
        let resource =
              path.isAbsolute(jsonImport.resource)
                ? jsonImport.resource
                : path.join(dirname, jsonImport.resource),
            resolvedYamlImport
        ;

        if (resolvedImports.includes(resource)) {
          throw importCircularReferenceException(resource, yamlFile);
        }

        resolvedYamlImport = resolveYamlImportSync(resource);
        if (!_.has(jsonImport, 'pick')) return resolvedYamlImport;

        return _.chain(jsonImport)
                .get('pick', [])
                .transform((accu, value) => {
                             if (!Array.isArray(value)) {value = [value];}
                             const get = _.get(resolvedYamlImport, value[0], null);
                             const set = value[1] || value[0]; // if no destination is set we use the get key

                             if (_.isNil(get)) return; // nil values are silently ignored

                             _.set(accu, set, get);
                           },
                           {}
                )
                .value();
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

function _import (file) {
  // How do we handle file by type
  const mapping = {
    '.json': fs.readJsonSync,
    '.yml' : yaml.load.bind(yaml)
  };

  const func = _.get(mapping, path.extname(file), mapping['.yml']);

  if (path.extname(file) === '') {
    file = file + '.yml';
  }

  const result = _.attempt(func, file);

  if (result instanceof Error) throw result;

  return result;
}

function importCircularReferenceException (importedYamlFile, yamlFile) {
  let err = new Error(`Circular reference detected importing ${importedYamlFile} in ${yamlFile}`);
  err.name = 'importCircularReferenceException';
  return err;
}

function typeException (parameters) {
  let err = new Error(`parameters must be a litteral object, it is presently: ${_toType(parameters)} => ${parameters}`);
  err.name = 'typeException';
  return err;
}

function forbidenPropertyException (property) {
  let err = new Error(`this property is forbiden: ${property}`);
  err.name = 'forbidenPropertyException';
  return err;
}


function _toType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

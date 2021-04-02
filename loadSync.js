'use strict';

const
  yaml  = require('yamljs'),
  _     = require('lodash'),
  path  = require('path'),
  fs    = require('fs-extra')
;

const fillPlaceholder = require('./fillPlaceholder')
;

module.exports = loadSync;

function loadSync (file) {

  let config;
  const resolvedImports = [];

  config = resolveYamlImportSync(file);
  config = fillPlaceholder(config || {});

  if (config.hasOwnProperty('parameters') && !_.isPlainObject(config.parameters)) {
    throw typeException('parameters', 'plain Object', config.parameters);
  }

  return config;

  function resolveYamlImportSync (yamlFile)/* use (resolvedImports)*/ {
    let json,
        dirname = path.dirname(yamlFile)
    ;

    json = _import(yamlFile) || {};
    resolvedImports.push(yamlFile);

    if(!_.isPlainObject(json)){
      throw typeException('Imported file '+ yamlFile, 'plain Object', json);
    }

    if (json.hasOwnProperty('parameters') && !_.isPlainObject(json.parameters)) {
      throw typeException('parameters', 'plain Object', json.parameters);
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
                .get('pick', {})
                .transform((accu, destinationPath, sourcePath) => {
                             if (!_.has(resolvedYamlImport, sourcePath)) return;
                             if (_.isNil(destinationPath)) {destinationPath = sourcePath;}
                             const get = _.get(resolvedYamlImport, sourcePath);
                             const set = destinationPath;

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
    '.yml' : _loadYml,
    '.js' : require,
    '.node': require
  };

  const func = _.get(mapping, path.extname(file), mapping['.yml']);

  if (path.extname(file) === '') {
    file = file + '.yml';
  }
    
  return func(file);
}

function _loadYml(file){
  return yaml.parse(fs.readFileSync(file, {encoding:'utf8'}));
}

function importCircularReferenceException (importedYamlFile, yamlFile) {
  let err = new Error(`Circular reference detected importing ${importedYamlFile} in ${yamlFile}`);
  err.name = 'importCircularReferenceException';
  return err;
}

function typeException (name, expectedType, value) {
  let err = new Error(`${name} must be a ${expectedType}, it is presently: ${_toType(value)} => ${value}`);
  err.name = 'typeException';
  return err;
}

function forbidenPropertyException (property) {
  let err = new Error(`this property is forbiden: ${property}`);
  err.name = 'forbidenPropertyException';
  return err;
}


function _toType (obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

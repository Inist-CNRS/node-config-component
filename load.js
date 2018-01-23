'use strict';
// Work in progress
// @todo Async version of config loader, needs to be changed to work accordingly with the sync version.


const async = require('async'),
      fs    = require('fs'),
      yaml  = require('yamljs'),
      _     = require('../../../node_modules/async/node_modules/lodash'), // @todo:Hack to get Lodash v4
      utils = require('./utils')
;

const fillPlaceholder = require('./fillPlaceholder')
;

module.exports = load;

function load (/* file, callback */) {
  const callback = _.last(arguments);
  let file;

  if(arguments.length === 1) {
    file =utils.defaultPath;
  }

  fs.readFile(file, 'utf8', (err, config) => {
    if (err) return callback(err);

    resolveYamlImport(config, (_err, _config) => {
      if (_err) return callback(_err);

      return callback(null, fillPlaceholder(_config));
    });
  });
}


function resolveYamlImport (yamlString, callback) {
  let json;

  try {
    json = yaml.parse(yamlString);
  } catch (err) {
    return process.nextTick(callback.bind(null, err));
  }
  if (!json.imports) return process.nextTick(callback.bind(null, null, json));

  async.map(
    json.imports,
    (jsonImport, _callback) => {
      fs.readFile(
        jsonImport.resource,
        'utf8',
        (err, _yamlString) => {
          if (err) return _callback(err);

          resolveYamlImport(_yamlString, _callback);

        }
      );
    },
    (err, results) => {
      if (err) callback(err);

      results.push(json);

      json =
        _(_.spread(_.defaultsDeep)(results))
          .omit('imports')
          .value();

      return callback(null, json);
    }
  );
}

'use strict';
const path         = require('path'),
      fs           = require('fs'),
      _            = require('lodash'),
      moduleConfig = require('./getModuleConfig.js')()
;

const utils = {};

module.exports = utils;

utils.isNodeEnvSet = isNodeEnvSet;
utils.getEnv = getEnv;
utils.basename = basename;
utils.getPath = getPath;
utils.defaultPath = path.join(moduleConfig.DEFAULT_PATH, moduleConfig.CONFIG_FILE);
utils.resolve = resolve;

function isNodeEnvSet () {
  return !!(process.env.hasOwnProperty('NODE_ENV') && process.env.NODE_ENV.replace(/\s/g, '').length);
}

function basename () {
  if (!isNodeEnvSet()) return moduleConfig.CONFIG_FILE;

  return `config_${getEnv()}.yml`;
}

function getEnv () {
  return process.env.NODE_ENV;
}

function getPath (fromFilePath) {
  const configDir = fromFilePath ? resolve(fromFilePath) : moduleConfig.DEFAULT_PATH;

  return path.join(configDir, basename());
}

function resolve (fromFilePath) {
  const packageDir = _resolve(path.dirname(fromFilePath)),
        configDir  = path.join(packageDir, 'config')
  ;

  try {
    fs.readdirSync(configDir);
  } catch (err) {
    if (err.code === 'ENOENT') throw configDirNotFoundException(fromFilePath);
    throw err;
  }

  return configDir;

  // package.json resolver
  function _resolve (dirPath) {
    _resolve.i = _resolve.i || 0;
    if (fs.existsSync(path.join(dirPath, 'package.json'))) {
      return dirPath;
    }
    if (dirPath === '/' || _resolve.i === 16) throw configDirNotFoundException(fromFilePath);
    ++_resolve.i;
    return _resolve(path.dirname(dirPath));
  }
}

function configDirNotFoundException (filename) {
  let err = new Error(`No config dir for module ${filename}`);
  err.name = 'configDirNotFoundException';
  return err;
}

function packageNotFoundException (filename) {
  let err = new Error(`No package path for module ${filename}`);
  err.name = 'packageNotFoundException';
  return err;
}


'use strict';
const path         = require('path'),
      fs           = require('fs'),
      moduleConfig = require('./getModuleConfig.js')()
;

const utils = {};

module.exports = utils;

utils.isNodeEnvSet = isNodeEnvSet;
utils.getEnv = getEnv;
utils.basename = basename;
utils.getEnvPathFrom = getEnvPathFrom;
utils.getDefaultPathFrom = getDefaultPathFrom;
utils.defaultPath = path.join(moduleConfig.DEFAULT_PATH, 'config.yml');
utils.resolve = resolve;

function isNodeEnvSet () {
  return !!(process.env.hasOwnProperty('NODE_ENV') && process.env.NODE_ENV.replace(/\s/g, '').length);
}

function basename () {
  if (!isNodeEnvSet()) return 'config.yml';

  return `config_${getEnv()}.yml`;
}

function getEnv () {
  return process.env.NODE_ENV;
}

function getDefaultPathFrom (fromFilePath) {
  const configDir = fromFilePath ? resolve(fromFilePath) : moduleConfig.DEFAULT_PATH;

  return path.join(configDir, 'config.yml');
}

function getEnvPathFrom (fromFilePath) {
  const configDir = fromFilePath ? resolve(fromFilePath) : moduleConfig.DEFAULT_PATH;

  return path.join(configDir, basename());
}

/**
 * Resolve config directory path
 * @param fromFilePath
 * @returns String path
 */
function resolve (fromFilePath) {
  const fileStat = fs.statSync(fromFilePath);
  fromFilePath = fileStat.isFile() ? path.dirname(fromFilePath) : fromFilePath;
  
  const packageDir = _resolve(fromFilePath),
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
    if (dirPath === '/' || _resolve.i === 16) throw packageNotFoundException(fromFilePath);
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


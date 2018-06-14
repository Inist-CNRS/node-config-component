'use strict';
const path         = require('path'),
      fs           = require('fs')
;

const utils = {};

module.exports = utils;

utils.isNodeEnvSet = isNodeEnvSet;
utils.getEnv = getEnv;
utils.basename = basename;
utils.getEnvPathFrom = getEnvPathFrom;
utils.getProductionPathFrom = getProductionPathFrom;
utils.resolve = resolve;

function isNodeEnvSet () {
  return !!(process.env.hasOwnProperty('NODE_ENV') && process.env.NODE_ENV.replace(/\s/g, '').length);
}

function basename () {
  return `config_${getEnv()}.yml`;
}

function getEnv () {
  if (!isNodeEnvSet()) return 'production';

  return process.env.NODE_ENV;
}

function getProductionPathFrom (fromFilePath) {
  return path.join(resolve(fromFilePath), 'config_production.yml');
}

function getEnvPathFrom (fromFilePath) {
  return path.join(resolve(fromFilePath), basename());
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


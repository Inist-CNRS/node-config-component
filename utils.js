'use strict';
const path = require('path'),
      fs   = require('fs'),
      _    = require('lodash')
;

const utils = {};

module.exports = utils;

utils.isNodeEnvSet = isNodeEnvSet;
utils.getEnv = _.memoize(getEnv);
utils.basename = basename;
utils.getEnvPathFrom = getEnvPathFrom;
utils.getProductionPathFrom = getProductionPathFrom;
utils.resolve = _.memoize(resolve);

function isNodeEnvSet () {
    return !!(process.env.hasOwnProperty('NODE_ENV') && process.env.NODE_ENV.replace(/\s/g, '').length);
}

function basename (fromFilePath) {
    return `config_${utils.getEnv(fromFilePath)}.yml`;
}

function getEnv (fromFilePath) {
    if (!isNodeEnvSet() || _isFileInSubModule(fromFilePath)) return 'production';

    return process.env.NODE_ENV;
}

function _isFileInSubModule (fromFilePath) {

    const configDirPath = utils.resolve(fromFilePath);
    const parentModulePath = path.resolve(configDirPath, '../../');

    return parentModulePath.split(path.sep).includes('node_modules');
}

function getProductionPathFrom (fromFilePath) {
    return path.join(utils.resolve(fromFilePath), 'config_production.yml');
}

function getEnvPathFrom (fromFilePath) {
    const configDirPath = utils.resolve(fromFilePath);
    return path.join(configDirPath, basename(fromFilePath));
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


'use strict';

const
  fs           = require('fs-extra'),
  path         = require('path'),
  moduleConfig = require('./getModuleConfig')()
;

const
  configPath    = path.join(moduleConfig.DEFAULT_PATH, moduleConfig.CONFIG_FILE),
  gitIgnorePath = path.join(moduleConfig.DEFAULT_PATH, '.gitignore')
;

module.exports = checkConfigDir;

function checkConfigDir () {
  fs.ensureDirSync(moduleConfig.DEFAULT_PATH);
  if (!fs.existsSync(configPath)) {
    fs.appendFileSync(configPath, '%YAML 1.2\n---\n');
  }
  if (!fs.existsSync(gitIgnorePath)) {
    fs.appendFileSync(gitIgnorePath, moduleConfig.SECRET_PARAMETERS_FILE);
  }
}

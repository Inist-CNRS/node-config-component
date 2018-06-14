'use strict';

const
  fs           = require('fs-extra'),
  path         = require('path'),
  moduleConfig = require('./getModuleConfig')()
;


module.exports = installConfigDirNx;

/**
 * Install config/config.yml and config/.gitignore if not exists.
 * @param configDir
 */
function installConfigDirNx (configDir = moduleConfig.DEFAULT_PATH) {
  const configPath    = path.join(configDir, 'config_production.yml'),
        gitIgnorePath = path.join(configDir, '.gitignore')
  ;
  if (!fs.pathExistsSync(configPath)) {
    fs.outputFileSync(configPath, '%YAML 1.2\n---\n');
  }

  if (!fs.pathExistsSync(gitIgnorePath)) {
    fs.outputFileSync(gitIgnorePath, moduleConfig.SECRET_PARAMETERS_FILE);
  }
}

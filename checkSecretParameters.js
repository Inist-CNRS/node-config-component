'use strict';

const
  _            = require('lodash'),
  fs           = require('fs-extra'),
  yaml         = require('yamljs'),
  moduleConfig = require('./getModuleConfig')()
;

module.exports = checkSecretParameters;


// Check if parameters and dist parameters are keys iso
function checkSecretParameters (parametersPath) {

  const distParametersPath = parametersPath + '.dist';

  let distParameters,
      parameters
  ;

  if (!fs.existsSync(distParametersPath)) return;

  distParameters = _.get(yaml.load(distParametersPath), 'parameters');
  if (!distParameters) return;

  if (!fs.existsSync(parametersPath)) {
    fs.copySync(distParametersPath, parametersPath);
    console.warn(`ConfigComponent: Created ${parametersPath} from ${distParametersPath}, please check the keys.`);
    return;
  }

  parameters = yaml.load(parametersPath).parameters;

  let diff  = _.difference(_.keys(distParameters), _.keys(parameters)),
      diff2 = _.difference(_.keys(parameters), _.keys(distParameters))
  ;

  diff = diff.concat(diff2);

  if (diff.length) throw distParametersException(diff);
}

function distParametersException (diff) {
  let err = new Error(`${moduleConfig.SECRET_PARAMETERS_FILE} and  ${moduleConfig.SECRET_PARAMETERS_FILE}.dist must have the exact same keys, mismatch on: ${diff.join(
    ', ')}`);

  err.name = 'distParametersException';
  return err;
}

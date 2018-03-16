'use strict';

const yaml           = require('yamljs'),
      _              = require('lodash'),
      styleComponent = require('./style'),
      envStyle       = styleComponent.envStyle,
      indent         = styleComponent.indent
;

const
  utils    = require('./utils'),
  loadSync = require('./loadSync')
;


const
  yellow = 226,
  blue   = 39,
  orange = 214,
  green  = 82,
  violet = 165,
  grey   = 246
;

module.exports = view;

function view () {
  const json = loadSync(utils.getPath());

  _.defaults(json, {env: {}, parameters: {}});

  const config     = _.omit(json, ['env', 'parameters']),
        parameters = _.pick(json, ['parameters']),
        env        = _.pick(json, ['env'])
  ;

  let
    yamlConfig     = yaml.dump(config, 4, 4),
    yamlParameters = yaml.dump(parameters, 3),
    yamlEnv        = yaml.dump(env, 3)
  ;

  console.info('\n' + envStyle(`Config component:`, 232, {bold: true, bgColor: yellow}));
  console.info(`\n${envStyle('File', violet, {bold: true})}: ${utils.basename()}`);
  console.info(`\n${envStyle('Env',
                             violet,
                             {bold: true})}: ${utils.isNodeEnvSet() ? process.env.NODE_ENV : 'UNSET'}\n`);
  console.info(prettify(yamlEnv));
  console.info(prettify(yamlParameters));
  console.info(envStyle('---', yellow));
  console.info(envStyle(`config:`, yellow, {bold: true}) + envStyle(`(${utils.basename()})`,
                                                                    violet,
                                                                    {bold: true}));
  console.info(indent(_.isEmpty(config) ? 'Empty configuration' : prettify(yamlConfig), 4));
  console.info(envStyle('---', yellow));
}

function prettify (yamlString) {
  return yamlString
    .replace(/^()(?!parameters|env)([^\s].*?)(:\s)/gm, `$1${envStyle('$2', yellow, {bold: true})}$3`) // first level keys
    .replace(/^(\u0020+)([^ ].*?)(:\s)/gm, `$1${envStyle('$2', blue)}$3`) // nested keys
    .replace(/^()(parameters)(:\s)/gm, `$1${envStyle('$2', orange, {bold: true})}$3`) //  parameters key
    .replace(/^()(env)(:\s)/gm, `$1${envStyle('$2', green, {bold: true})}$3`) // env key
    .replace(/(?!:\s)(UNSET)$/gm, envStyle('$1', grey)) // Unset flag
    ;
}
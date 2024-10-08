'use strict';

const yaml = require('yamljs'),
  _ = require('lodash'),
  { basename } = require('path'),
  dtrim = require('dtrim')
;

const
  { envStyle, indent: _indent } = require('./style'),
  configComponent = require('./configComponent'),
  utils = require('./utils')
;

const
  yellow = 226,
  blue = 39,
  orange = 214,
  green = 82,
  violet = 165,
  grey = 246
;

module.exports = view;

function view ({ trimDepth , inlineDepth = 4, indent = 3, size, path }) {
  const json = configComponent._getFullConfig({ filename: process.cwd() });

  _.defaults(json, { env: {}, parameters: {} });

  const config = _.omit(json, ['env', 'parameters', 'filePath', 'fileEnv']),
    parameters = _.pick(json, ['parameters']),
    env = _.pick(json, ['env'])
  ;

  _.mixin({
    'sortKeysBy': function (obj, comparator) {
      let keys = _.sortBy(_.keys(obj), (key) => {
        return comparator ? comparator(obj[key], key) : key;
      });

      return _.zipObject(keys, _.map(keys, (key) => {
        return obj[key];
      }));
    }
  });

  env.env = _.sortKeysBy(env.env);
  parameters.parameters = _.sortKeysBy(parameters.parameters);
  const trim = dtrim.trimmer({
    depth: trimDepth,
    size
  });
  const configFragment = path != null ? _.get(config, path) : config;
  let
    yamlConfig = yaml.dump(trim(configFragment), inlineDepth, indent),
    yamlParameters = yaml.dump(parameters, inlineDepth, indent),
    yamlEnv = yaml.dump(env, inlineDepth, indent)
  ;

  console.info('\n' + envStyle(`Config component:`, 232, { bold: true, bgColor: yellow }));
  console.info(`\n${envStyle('File', violet, { bold: true })}: ${json.filePath}`);
  console.info(`\n${envStyle('Env',
    violet,
    { bold: true })}: ${utils.isNodeEnvSet() ? json.fileEnv : 'UNSET => default to production'}\n`);
  console.info(prettify(yamlEnv));
  console.info(prettify(yamlParameters));
  console.info(envStyle('---', yellow));
  console.info(envStyle(`config:`, yellow, { bold: true }) + envStyle(`(${basename(json.filePath)})`,
    violet,
    { bold: true }));

  if (path != null) {
    console.info(_indent(envStyle(path, yellow, { bold: true }), indent) + ':');
  }
  console.info(_indent(_.isEmpty(configFragment) ? 'Empty configuration' : prettify(yamlConfig),
    path != null ? indent * 2 : indent));
  console.info(envStyle('---', yellow));
}

function prettify (yamlString) {
  return yamlString
    .replace(/^()(?!parameters|env)([^\s{].*?)(:\s)/gm,
      `$1${envStyle('$2', yellow, { bold: true })}$3`) // first level keys
    .replace(/^(\u0020+)([^ -].*?)(:\s)(?!\S+)/gm, `$1${envStyle('$2', blue)}$3`) // nested keys
    .replace(/^()(parameters)(:\s)/gm, `$1${envStyle('$2', orange, { bold: true })}$3`) //  parameters key
    .replace(/^()(env)(:\s)/gm, `$1${envStyle('$2', green, { bold: true })}$3`) // env key
    .replace(/(?!:\s)(UNSET)$/gm, envStyle('$1', grey)) // Unset flag
    ;
}

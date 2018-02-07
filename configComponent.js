'use strict';
/**
 * @ref http://docs.ansible.com/ansible/YAMLSyntax.html
 */
const _ = require('lodash');

const
  loadSync        = require('./loadSync'),
  utils           = require('./utils'),
  checkConfigDir  = require('./checkConfigDir'),
  checkParameters = require('./checkParameters'),
  view            = require('./view')
;

checkConfigDir();
checkParameters();

const configComponent = module.exports;

// get Config dynamically depending on NODE_ENV
configComponent.get = get;

// View prettyfied config depending on NODE_ENV
configComponent.view = view;

// Sync
configComponent.loadSync = _.memoize(loadSync);


function get () {
  return _.omit(this.loadSync(utils.getPath()), ['parameters', 'env']);
}

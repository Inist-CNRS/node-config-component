'use strict';

const _               = require('lodash'),
      configComponent = require('./configComponent')
;

const index = _.mixin(module.exports, configComponent);
_.unset(require.cache, _.findKey(require.cache, module));

index.get = function(){
  return configComponent.get(module.parent);
};



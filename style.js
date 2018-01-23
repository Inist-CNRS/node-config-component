'use strict';
const _          = require('lodash');

exports.envStyle = envStyle;
exports.style    = style;
exports.indent   = indent;


function envStyle (string) {
  if (process.env.NODE_ENV === 'production') return string;
  return style(...arguments);
}

function style (string, color = 256, {bold = false, bgColor = null} = {}) {
  return `\u001b[${bgColor ? `48;5;${bgColor};` : ''}${bold ? '1;' : ''}38;5;${color}m${string}\u001b[0m`;
}

function indent (string, length = 2) {
  return string.replace(/^.*$/gm, (match) => {
    return _.repeat(' ', length) + match;
  });
}

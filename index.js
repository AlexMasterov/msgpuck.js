'use strict';

const V8_VERSION = +process.versions.v8.split('.', 2).join('');

function requireMsgPuck() {
  if (V8_VERSION > 69) return require('./src');
  if (V8_VERSION > 66) return require('./dist/v8-6.7');
  return require('./dist/v8-6.2');
}

module.exports = requireMsgPuck();

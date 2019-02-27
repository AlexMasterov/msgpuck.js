'use strict';

const V8_VERSION = +process.versions.v8.split('.', 2).join('');

function requireMsgpuck() {
  if (V8_VERSION > 69) return require('./dist/latest/cjs');
  if (V8_VERSION > 66) return require('./dist/v8v67/cjs');
  return require('./dist/v8v62/cjs');
}

module.exports = requireMsgpuck();

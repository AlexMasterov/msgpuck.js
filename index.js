'use strict';

const v8ver = +process.versions.v8.split('.', 2).join('');

function selectMsgPuck() {
  if (v8ver > 69) return require('./src');
  if (v8ver > 66) return require('./dist/v8-6.7');
  return require('./dist/v8-6.2');
}

module.exports = selectMsgPuck();

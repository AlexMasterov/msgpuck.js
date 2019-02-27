'use strict';

const ExtFn = `
function Ext(type, bin) {
  this.type = type;
  this.bin = bin;
}
`;

const Ext = code => code
  .replace(/\s+function required\(.+[^}]+}[^}]+}/, '')
  .replace(/\s+class Ext.*[^}]+}\r\n}/, ExtFn);

const MsgPackError = code => code
  .replace(/\s+(class MsgPackError.+)[^}]+}\r\n/, '$1');

module.exports = {
  ...require('./decoder'),
  ...require('./encoder'),
  'Ext.js': [Ext],
  'MsgPackError.js': [MsgPackError],
};

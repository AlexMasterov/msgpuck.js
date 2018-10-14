'use strict';

module.exports = class Optimizers {
  static get CHR() { return require('ascii-chr'); }
  static get bufToUtf8() { return require('./utf8-buf'); }
  static get utf8toBin() { return require('./utf8-bin'); }

  static get FastBuffer() { return Buffer[Symbol.species]; }
};

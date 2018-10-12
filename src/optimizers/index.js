module.exports = class Optimizers {
  static get CHR() { return require('ascii-chr'); }
  static get FastBuffer() { return Buffer[Symbol.species]; }
  static get utf8toBin() { return require('./utf8').utf8toBin; }
  static get bufToUtf8() { return require('./utf8').bufToUtf8; }
  static get bufToBin() { return require('./binary'); }
};

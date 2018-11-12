'use strict';

module.exports = class Encoders {
  static get encodeAscii() { return require('./encodeAscii'); }
  static get encodeMapHeader() { return require('./encodeMapHeader'); }
  static get selectEncoderFloat() { return require('./selectEncoderFloat'); }
};

'use strict';

module.exports = class Codecs {
  static get Codec() { return require('./Codec'); }
  static get MapCodec() { return require('./MapCodec'); }
  static get ScalarObjectCodec() { return require('./ScalarObjectCodec'); }
};

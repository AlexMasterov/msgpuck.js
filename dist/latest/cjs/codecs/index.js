'use strict';

module.exports = class Codecs {
  static get MapCodec() { return require('./MapCodec'); }
  static get ScalarObjectCodec() { return require('./ScalarObjectCodec'); }

  static get LongCodec() { return require('./long/LongCodec'); }
  static get decodeLong() { return require('./long/decodeLong'); }
};

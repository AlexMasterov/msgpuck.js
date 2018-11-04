module.exports = class Codecs {
  static get ScalarObjectCodec() { return require('./ScalarObjectCodec'); }
  static get MapCodec() { return require('./MapCodec'); }
};

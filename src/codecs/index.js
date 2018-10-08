module.exports = class Codecs {
  static get BooleanCodec() { return require('./BooleanCodec'); }
  static get ErrorCodec() { return require('./ErrorCodec'); }
  static get MapCodec() { return require('./MapCodec'); }
  static get NumberCodec() { return require('./NumberCodec'); }
  static get RegExpCodec() { return require('./RegExpCodec'); }
  static get SetCodec() { return require('./SetCodec'); }
  static get StringCodec() { return require('./StringCodec'); }
  static get SymbolCodec() { return require('./SymbolCodec'); }
  static get UndefinedCodec() { return require('./UndefinedCodec'); }
};

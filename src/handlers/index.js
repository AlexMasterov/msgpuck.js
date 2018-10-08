module.exports = class Handlers {
  static get throwsDecoderHandler() { return require('./throwsDecoderHandler'); }
  static get throwsEncoderHandler() { return require('./throwsEncoderHandler'); }
};

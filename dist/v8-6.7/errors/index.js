module.exports = class Errors {
  static get DecodingFailed() { return require('./DecodingFailed'); }
  static get EncodingFailed() { return require('./EncodingFailed'); }
  static get InsufficientData() { return require('./InsufficientData'); }
};

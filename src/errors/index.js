'use strict';

module.exports = class Errors {
  static get InsufficientData() { return require('./InsufficientData'); }
  static get MsgPackError() { return require('./MsgPackError'); }
  static get PackingFailed() { return require('./PackingFailed'); }
  static get UnpackingFailed() { return require('./UnpackingFailed'); }
};

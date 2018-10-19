'use strict';
/* istanbul ignore file */

module.exports = class MsgPuck {
  static get Codec() { return require('./Codec'); }
  static get Decoder() { return require('./Decoder'); }
  static get Encoder() { return require('./Encoder'); }
  static get Ext() { return require('./Ext'); }
  static get MsgPackError() { return require('./MsgPackError'); }

  static get codecs() { return require('./codecs'); }
  static get errors() { return require('./errors'); }
};

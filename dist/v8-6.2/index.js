'use strict';

module.exports = class MsgPuck {
  static get Encoder() { return require('./Encoder'); }
  static get Decoder() { return require('./Decoder'); }
  static get Ext() { return require('./Ext'); }
  static get Codec() { return require('./Codec'); }

  static get codecs() { return require('./codecs'); }
  static get errors() { return require('./errors'); }
};

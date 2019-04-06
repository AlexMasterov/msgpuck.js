'use strict';

module.exports = class MsgPuck {
  static get Decoder() { return require('./Decoder'); }
  static get Encoder() { return require('./Encoder'); }
  static get Ext() { return require('./Ext'); }

  static get errors() { return require('./errors'); }
  static get handlers() { return require('./handlers'); }
  static get codecs() { return require('./codecs'); }
};

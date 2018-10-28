'use strict';
/* istanbul ignore file */

const isNodeXX = process.version[2] !== '.';

module.exports = class MsgPuck {
  static get Codec() { return require('./Codec'); }
  static get Decoder() { return isNodeXX ? require('./Decoder') : require('./legacy/Decoder'); }
  static get Encoder() { return isNodeXX ? require('./Encoder') : require('./legacy/Encoder'); }
  static get Ext() { return require('./Ext'); }
  static get MsgPackError() { return require('./MsgPackError'); }

  static get codecs() { return require('./codecs'); }
  static get errors() { return require('./errors'); }
};

'use strict';

module.exports = class MsgPuck {
  static get Packer() { return require('./Packer'); }
  static get Unpacker() { return require('./Unpacker'); }
  static get Ext() { return require('./Ext'); }

  static get packs() { return require('./packs'); }
  static get errors() { return require('./errors'); }
  static get codecs() { return require('./codecs'); }
};

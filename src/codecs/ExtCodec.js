'use strict';

const Ext = require('../Ext');
const { packExt } = require('../packs');

class ExtCodec {
  static pack(value, packer) {
    if (value.constructor != Ext) return null;
    return packExt(value.type, value.bin);
  }
}

module.exports = ExtCodec;

'use strict';

const Codec = require('../Codec');

const objectEntries = Object.entries;

class MapCodec extends Codec {
  static get type() {
    return 0x0c;
  }

  encode(encoder, value) {
    return (value.constructor == Map)
      ? encoder.encodeExt(this.type, encoder.encodeMap(value))
      : null;
  }

  decode(decoder, length) {
    return new Map(objectEntries(decoder.parse()));
  }
}

module.exports = MapCodec;

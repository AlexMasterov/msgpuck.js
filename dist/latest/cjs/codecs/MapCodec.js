'use strict';

const Codec = require('./Codec');
const { encodeMapHeader } = require('../encoders');

const objectEntries = Object.entries;

class MapCodec extends Codec {
  static get type() {
    return 0x0c;
  }

  encode(encoder, value) {
    if (value.constructor != Map) return null;

    let bin = encodeMapHeader(value.size);
    for (const [key, val] of value) {
      bin += encoder.encode(key);
      bin += encoder.encode(val);
    }

    return encoder.encodeExt(this.type, bin);
  }

  decode(decoder, length) {
    return new Map(objectEntries(decoder.parse()));
  }
}

module.exports = MapCodec;

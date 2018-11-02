'use strict';

const Codec = require('../Codec');

const ObjectEntries = Object.entries;

class MapCodec extends Codec {
  static get type() {
    return 0x0c;
  }

  supports(value) {
    return value.constructor == Map;
  }

  encode(encoder, value) {
    return encoder.encodeMap(value);
  }

  decode(decoder, length) {
    return new Map(ObjectEntries(decoder.parse()));
  }
}

module.exports = MapCodec;

'use strict';

const Codec = require('../Codec');

class RegExpCodec extends Codec {
  static get type() {
    return 0x0b;
  }

  supports(value) {
    return value.constructor == RegExp;
  }

  encode(encoder, value) {
    const data = value.flags
      ? [value.source, value.flags]
      : [value.source];

    return encoder.encodeArray(data);
  }

  decode(decoder, length) {
    return new RegExp(...decoder.parse());
  }
}

module.exports = RegExpCodec;

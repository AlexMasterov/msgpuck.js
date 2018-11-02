'use strict';

const Codec = require('../Codec');

class NumberCodec extends Codec {
  static get type() {
    return 0x02;
  }

  supports(value) {
    return value.constructor == Number;
  }

  encode(encoder, value) {
    return encoder.encodeInt(value);
  }

  decode(decoder, length) {
    return decoder.parse();
  }
}

module.exports = NumberCodec;

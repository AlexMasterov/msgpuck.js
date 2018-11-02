'use strict';

const Codec = require('../Codec');

class StringCodec extends Codec {
  static get type() {
    return 0x03;
  }

  supports(value) {
    return value.constructor == String;
  }

  encode(encoder, value) {
    return encoder.encodeStr(value);
  }

  decode(decoder, length) {
    return decoder.parse();
  }
}

module.exports = StringCodec;

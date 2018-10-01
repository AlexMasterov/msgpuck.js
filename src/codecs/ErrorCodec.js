'use strict';

const Codec = require('../Codec');

class ErrorCodec extends Codec {
  static get type() {
    return 0x0e;
  }

  supports(value) {
    return value.constructor === Error;
  }

  encode(encoder, value) {
    return encoder.encodeArray([value.message, value.name]);
  }

  decode(decoder, length) {
    return new Error(...decoder.parse());
  }
}

module.exports = ErrorCodec;

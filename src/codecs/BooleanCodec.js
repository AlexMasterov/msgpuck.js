'use strict';

const Codec = require('../Codec');

const BooleanValueOf = Boolean.prototype.valueOf;

class BooleanCodec extends Codec {
  static get type() {
    return 0x01;
  }

  supports(value) {
    return value.constructor == Boolean;
  }

  encode(encoder, value) {
    return BooleanValueOf.call(value) ? '\xc3' : '\xc2';
  }

  decode(decoder, length) {
    return decoder.parse();
  }
}

module.exports = BooleanCodec;

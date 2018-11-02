'use strict';

const Codec = require('../Codec');

class SetCodec extends Codec {
  static get type() {
    return 0x0d;
  }

  supports(value) {
    return value.constructor == Set;
  }

  encode(encoder, value) {
    const array = new Array(value.size);

    let i = 0;
    for (const arr of value) {
      array[i++] = arr;
    }

    return encoder.encodeArray(array);
  }

  decode(decoder, length) {
    return new Set(decoder.parse());
  }
}

module.exports = SetCodec;

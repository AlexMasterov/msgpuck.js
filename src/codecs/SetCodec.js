'use strict';

const Codec = require('../Codec');

class SetCodec extends Codec {
  static get type() {
    return 0x0d;
  }

  supports(value) {
    return value.constructor === Set;
  }

  encode(value) {
    return [...value];
  }

  decode(data) {
    return new Set(data);
  }
}

module.exports = SetCodec;

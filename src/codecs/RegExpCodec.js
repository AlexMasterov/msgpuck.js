'use strict';

const Codec = require('../Codec');

class RegExpCodec extends Codec {
  static get type() {
    return 0x0b;
  }

  supports(value) {
    return value instanceof RegExp;
  }

  encode(value) {
    return value.flags
      ? [value.source, value.flags]
      : [value.source];
  }

  decode(data) {
    return new RegExp(...data);
  }
}

module.exports = RegExpCodec;

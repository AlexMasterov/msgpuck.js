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
    if (value.flags) {
      return [value.source, value.flags];
    }

    return [value.source];
  }

  decode(data) {
    return new RegExp(...data);
  }
}

module.exports = RegExpCodec;

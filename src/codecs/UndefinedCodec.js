'use strict';

const Codec = require('../Codec');

class UndefinedCodec extends Codec {
  static get type() {
    return 0x0a;
  }

  supports(value) {
    return value.__isUndefined__ === true;
  }

  encode(value) {
    return null;
  }

  decode(value) {
    return undefined;
  }
}

module.exports = UndefinedCodec;

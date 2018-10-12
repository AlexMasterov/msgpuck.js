'use strict';

const Codec = require('../Codec');

class UndefinedCodec extends Codec {
  static get type() {
    return 0x0a;
  }

  supports(value) {
    return value.__isUndefined__ === true;
  }

  encode(encoder, value) {
    return '\xc0';
  }

  decode(decoder, length) {
    return void 0;
  }
}

module.exports = UndefinedCodec;

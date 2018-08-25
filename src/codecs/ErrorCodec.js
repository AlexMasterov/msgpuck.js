'use strict';

const Codec = require('../Codec');

class ErrorCodec extends Codec {
  static get type() {
    return 0x0e;
  }

  supports(value) {
    return value.constructor === Error;
  }

  encode({ message, name }) {
    return { message, name };
  }

  decode({ message, name }) {
    return new Error(message, name);
  }
}

module.exports = ErrorCodec;

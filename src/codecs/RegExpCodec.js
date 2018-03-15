'use strict';

const Codec = require('../Codec');

const RegExpToString = RegExp.prototype.toString;

class RegExpCodec extends Codec {
  static get type() {
    return 0x0b;
  }

  supports(value) {
    return value instanceof RegExp;
  }

  encode(value) {
    // /xyz/i => ['pattern', 'flags']
    const [, ...regExp] = RegExpToString.call(value).split('/');

    return regExp;
  }

  decode(data) {
    return new RegExp(...data);
  }
}

module.exports = RegExpCodec;

'use strict';
/* istanbul ignore file */

const { packInt64 } = require('../../packs');

class LongCodec {
  static pack(value) {
    if (value.__isLong__ === false) return null;

    return (value.high < 0 ? '\xd3' : '\xcf')
      + packInt64(value.low, value.high);
  }
}

module.exports = LongCodec;

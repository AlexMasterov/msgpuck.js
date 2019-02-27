'use strict';
/* istanbul ignore file */

const { encodeInt64 } = require('../../encoders');

class LongCodec {
  encode(encoder, value) {
    if (value.__isLong__ === false) return null;

    return (value.high < 0 ? '\xd3' : '\xcf')
      + encodeInt64(value.low, value.high);
  }
}

module.exports = LongCodec;

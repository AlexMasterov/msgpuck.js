'use strict';

const { CHR } = require('../binary');
const packInt64 = require('./packInt64');

const packInt = (num) => {
  // negative fixint
  if (num > -0x21) {
    return CHR(num & 0xff);
  }
  // int 8
  if (num > -0x81) {
    return '\xd0'
      + CHR(num & 0xff);
  }
  // int 16
  if (num > -0x8001) {
    return '\xd1'
      + CHR(num >> 8 & 0xff)
      + CHR(num & 0xff);
  }
  // int 32
  if (num > -0x80000001) {
    return '\xd2'
      + CHR(num >> 24 & 0xff)
      + CHR(num >> 16 & 0xff)
      + CHR(num >> 8 & 0xff)
      + CHR(num & 0xff);
  }
  // int 64 safe
  if (num > -0x20000000000001) {
    return '\xd3'
      + encodeInt64(
        (num / 0x100000000 >> 0) - 1,
        num >>> 0
      );
  }
  // -Infinity
  return '\xcb\xff\xf0\x00\x00\x00\x00\x00\x00';
};

module.exports = packInt;

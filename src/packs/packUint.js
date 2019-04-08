'use strict';

const { CHR } = require('../binary');
const packInt64 = require('./packInt64');

const packUint = (num) => {
  // positive fixint
  if (num < 0x80) {
    return CHR(num);
  }
  // uint 8
  if (num < 0x100) {
    return '\xcc'
      + CHR(num);
  }
  // uint 16
  if (num < 0x10000) {
    return '\xcd'
      + CHR(num >> 8)
      + CHR(num & 0xff);
  }
  // uint 32
  if (num < 0x100000000) {
    return '\xce'
      + CHR(num >> 24 & 0xff)
      + CHR(num >> 16 & 0xff)
      + CHR(num >> 8 & 0xff)
      + CHR(num & 0xff);
  }
  // uint 64 safe
  if (num < 0x20000000000000) {
    return '\xcf'
      + encodeInt64(
        num >>> 11 | 1,
        num
      );
  }
  // Infinity
  return '\xcb\x7f\xf0\x00\x00\x00\x00\x00\x00';
};

module.exports = packUint;

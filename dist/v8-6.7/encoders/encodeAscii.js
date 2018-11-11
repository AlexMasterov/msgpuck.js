'use strict';

const { CHR } = require('../binary');

function encodeAscii(str) {
  const len = str.length;
  // fixstr
  if (len < 0x20) {
    return CHR(len | 0xa0)
      + str;
  }
  // str 8
  if (len < 0x100) {
    return '\xd9'
      + CHR(len)
      + str;
  }
  // str 16
  if (len < 0x10000) {
    return '\xda'
      + CHR(len >> 8)
      + CHR(len & 0xff)
      + str;
  }
  // str 32
  return '\xdb'
    + CHR(len >> 24 & 0xff)
    + CHR(len >> 16 & 0xff)
    + CHR(len >> 8 & 0xff)
    + CHR(len & 0xff)
    + str;
}

module.exports = encodeAscii;

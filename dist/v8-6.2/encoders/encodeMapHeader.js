'use strict';

/* istanbul ignore file */

const { CHR } = require('../binary');

function encodeMapHeader(len) {
  if (len === 0) return '\x80';
  // fixmap
  if (len < 0x10) {
    return CHR[0x80 | len];
  }
  // map 16
  if (len < 0x10000) {
    return '\xde'
      + CHR[len >> 8]
      + CHR[len & 0xff];
  }
  // map 32
  return '\xdf'
    + CHR[len >> 24 & 0xff]
    + CHR[len >> 16 & 0xff]
    + CHR[len >> 8 & 0xff]
    + CHR[len & 0xff];
}

module.exports = encodeMapHeader;

'use strict';

const { utf8toBin } = require('utf8-bin');
const { CHR } = require('../binary');

const makePackUtf8 = ({
  bufUseMin=15,
  bufAllocMin=2048,
  bufAlloc=Buffer.allocUnsafe,
  // private
  buf,
  alloc=0,
} = {}) =>
  (str) => {
    let { length } = str, bin;
    if (length === 0) return '\xa0';

    if (length < bufUseMin) {
      bin = utf8toBin(str);
      length = bin.length;
    } else {
      if (length > alloc) {
        alloc = bufAllocMin * (length >>> 10 | 2);
        buf = bufAlloc(alloc);
      }
      length = buf.utf8Write(str, 0);
      bin = buf.latin1Slice(0, length);
    }

    // fixstr
    if (length < 0x20) {
      return CHR(length | 0xa0)
        + bin;
    }
    // str 8
    if (length < 0x100) {
      return '\xd9'
        + CHR(length)
        + bin;
    }
    // str 16
    if (length < 0x10000) {
      return '\xda'
        + CHR(length >> 8)
        + CHR(length & 0xff)
        + bin;
    }
    // str 32
    return '\xdb'
      + CHR(length >> 24 & 0xff)
      + CHR(length >> 16 & 0xff)
      + CHR(length >> 8 & 0xff)
      + CHR(length & 0xff)
      + bin;
  };

module.exports = makePackUtf8;

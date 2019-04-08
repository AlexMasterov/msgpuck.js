'use strict';

const { CHR } = require('../binary');

const packExt = (type, bin) => {
  const ext = CHR(type & 0x7f) + bin;
  const len = bin.length;

  // fixext 1/2/4/8/16
  switch (len) {
    case 1: return '\xd4' + ext;
    case 2: return '\xd5' + ext;
    case 4: return '\xd6' + ext;
    case 8: return '\xd7' + ext;
    case 16: return '\xd8' + ext;
  }
  // ext 8
  if (len < 0x100) {
    return '\xc7'
      + CHR(len)
      + ext;
  }
  // ext 16
  if (len < 0x10000) {
    return '\xc8'
      + CHR(len >> 8)
      + CHR(len & 0xff)
      + ext;
  }
  // ext 32
  return '\xc9'
    + CHR(len >> 24 & 0xff)
    + CHR(len >> 16 & 0xff)
    + CHR(len >> 8 & 0xff)
    + CHR(len & 0xff)
    + ext;
};

module.exports = packExt;

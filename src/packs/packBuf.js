'use strict';

const { CHR } = require('../binary');

const packBuf = (buf) => {
  const len = buf.length;
  if (len === 0) return '\xc4\x00';

  let bin;
  if (len < 7) {
    bin = '';
    for (let i = 0; i < len; i++) {
      bin += CHR(buf[i]);
    }
  } else {
    bin = buf.latin1Slice(0, len);
  }

  // bin 8
  if (len < 0x100) {
    return '\xc4'
      + CHR(len)
      + bin;
  }
  // bin 16
  if (len < 0x10000) {
    return '\xc5'
      + CHR(len >> 8)
      + CHR(len & 0xff)
      + bin;
  }
  // bin 32
  return '\xc6'
    + CHR(len >> 24 & 0xff)
    + CHR(len >> 16 & 0xff)
    + CHR(len >> 8 & 0xff)
    + CHR(len & 0xff)
    + bin;
};

module.exports = packBuf;

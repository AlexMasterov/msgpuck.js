'use strict';

const { CHR } = require('../binary');

const makePackArr = (pack) =>
  (arr) => {
    const len = arr.length;
    if (len === 0) return '\x90';

    let bin;
    if (len < 0x10) { // fixarray
      bin = CHR(0x90 | len);
    } else if (len < 0x10000) { // array 16
      bin = '\xdc'
        + CHR(len >> 8)
        + CHR(len & 0xff);
    } else { // array 32
      bin = '\xdd'
        + CHR(len >> 24 & 0xff)
        + CHR(len >> 16 & 0xff)
        + CHR(len >> 8 & 0xff)
        + CHR(len & 0xff);
    }

    for (let i = 0; i < len; i++) {
      bin += pack(arr[i]);
    }

    return bin;
  };

module.exports = makePackArr;

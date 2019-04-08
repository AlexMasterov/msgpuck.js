'use strict';

const { CHR, i64 } = require('../binary');

const i8i64 = new Int8Array(i64.buffer);

const packBigInt = (bignum) => {
  i64[0] = bignum;
  return '\xd3'
    + CHR(i8i64[7] & 0xff)
    + CHR(i8i64[6] & 0xff)
    + CHR(i8i64[5] & 0xff)
    + CHR(i8i64[4] & 0xff)
    + CHR(i8i64[3] & 0xff)
    + CHR(i8i64[2] & 0xff)
    + CHR(i8i64[1] & 0xff)
    + CHR(i8i64[0] & 0xff);
};

module.exports = packBigInt;

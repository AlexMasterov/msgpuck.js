'use strict';

const { CHR, u64 } = require('../binary');

const u8u64 = new Uint8Array(u64.buffer);

const packBigUint = (bignum) => {
  u64[0] = bignum;
  return '\xcf'
    + CHR(u8u64[7])
    + CHR(u8u64[6])
    + CHR(u8u64[5])
    + CHR(u8u64[4])
    + CHR(u8u64[3])
    + CHR(u8u64[2])
    + CHR(u8u64[1])
    + CHR(u8u64[0]);
};

module.exports = packBigUint;

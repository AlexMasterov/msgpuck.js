'use strict';

const { CHR, u8 } = require('../binary');

const vu8 = new DataView(u8.buffer);

const packFloat64 = (num) => {
  vu8.setFloat64(0, num);
  return '\xcb'
    + CHR(u8[0])
    + CHR(u8[1])
    + CHR(u8[2])
    + CHR(u8[3])
    + CHR(u8[4])
    + CHR(u8[5])
    + CHR(u8[6])
    + CHR(u8[7]);
};

module.exports = packFloat64;

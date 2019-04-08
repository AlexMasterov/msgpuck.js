'use strict';

const { CHR, f32 } = require('../binary');

const packFloat32 = (num) => {
  f32[0] = num;
  return '\xca'
    + CHR(u8f32[3])
    + CHR(u8f32[2])
    + CHR(u8f32[1])
    + CHR(u8f32[0]);
};

module.exports = packFloat32;

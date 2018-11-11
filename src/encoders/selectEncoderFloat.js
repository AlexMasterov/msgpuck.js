'use strict';

const { CHR, f32, u8 } = require('../binary');

const fround = Math.fround;
const u8f32 = new Uint8Array(f32.buffer);
const vu8 = new DataView(u8.buffer);

function encodeFloat(num) {
  if (num === fround(num)) {
    f32[0] = num;
    return '\xca'
      + CHR(u8f32[3])
      + CHR(u8f32[2])
      + CHR(u8f32[1])
      + CHR(u8f32[0]);
  }

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
}

function encodeFloat32(num) {
  f32[0] = num;
  return '\xca'
    + CHR(u8f32[3])
    + CHR(u8f32[2])
    + CHR(u8f32[1])
    + CHR(u8f32[0]);
}

function encodeFloat64(num) {
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
}

function selectEncoderFloat(type) {
  if (type === '64') return encodeFloat64;
  if (type === '32') return encodeFloat32;
  return encodeFloat;
}

module.exports = selectEncoderFloat;

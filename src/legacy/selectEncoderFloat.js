'use strict';

const { CHR, f32, f64 } = require('./binary');

const fround = Math.fround;
const u8f32 = new Uint8Array(f32.buffer);
const u8f64 = new Uint8Array(f64.buffer);

function encodeFloat(num) {
  if (num === fround(num)) {
    f32[0] = num;
    return '\xca'
      + CHR[u8f32[3]]
      + CHR[u8f32[2]]
      + CHR[u8f32[1]]
      + CHR[u8f32[0]];
  }

  f64[0] = num;
  return '\xcb'
    + CHR[u8f64[7]]
    + CHR[u8f64[6]]
    + CHR[u8f64[5]]
    + CHR[u8f64[4]]
    + CHR[u8f64[3]]
    + CHR[u8f64[2]]
    + CHR[u8f64[1]]
    + CHR[u8f64[0]];
}

function encodeFloat32(num) {
  f32[0] = num;
  return '\xca'
    + CHR[u8f32[3]]
    + CHR[u8f32[2]]
    + CHR[u8f32[1]]
    + CHR[u8f32[0]];
}

function encodeFloat64(num) {
  f64[0] = num;
  return '\xcb'
    + CHR[u8f64[7]]
    + CHR[u8f64[6]]
    + CHR[u8f64[5]]
    + CHR[u8f64[4]]
    + CHR[u8f64[3]]
    + CHR[u8f64[2]]
    + CHR[u8f64[1]]
    + CHR[u8f64[0]];
}

function selectEncoderFloat(type) {
  if (type === '64') return encodeFloat64;
  if (type === '32') return encodeFloat32;
  return encodeFloat;
}

module.exports = selectEncoderFloat;

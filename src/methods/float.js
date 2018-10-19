'use strict';

const CHR = require('ascii-chr');

const f32 = new Float32Array(1);
const f64 = new Float64Array(1);
const u8f32 = new Uint8Array(f32.buffer);
const u8f64 = new Uint8Array(f64.buffer);

function encodeFloat(num) {
  f32[0] = num;
  if (f32[0] === num) {
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

module.exports = class Float {
  static get encodeFloat() { return encodeFloat; }
  static get encodeFloat32() { return encodeFloat32; }
  static get encodeFloat64() { return encodeFloat64; }
};

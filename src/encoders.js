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

function encodeUint64(num) {
  const hi = num / 0x100000000 >> 0;
  const lo = num >>> 0;
  return '\xcf'
    + CHR[hi >> 24 & 0xff]
    + CHR[hi >> 16 & 0xff]
    + CHR[hi >> 8 & 0xff]
    + CHR[hi & 0xff]
    + CHR[lo >> 24 & 0xff]
    + CHR[lo >> 16 & 0xff]
    + CHR[lo >> 8 & 0xff]
    + CHR[lo & 0xff];
}

function encodeInt64(num) {
  const hi = (num / 0x100000000 >> 0) - 1;
  const lo = num >>> 0;
  return '\xd3'
    + CHR[hi >> 24 & 0xff]
    + CHR[hi >> 16 & 0xff]
    + CHR[hi >> 8 & 0xff]
    + CHR[hi & 0xff]
    + CHR[lo >> 24 & 0xff]
    + CHR[lo >> 16 & 0xff]
    + CHR[lo >> 8 & 0xff]
    + CHR[lo & 0xff];
}

function selectEncoderFloat(type) {
  if (type === '64') return encodeFloat64;
  if (type === '32') return encodeFloat32;
  return encodeFloat;
}

module.exports = {
  encodeInt64,
  encodeUint64,
  selectEncoderFloat,
};

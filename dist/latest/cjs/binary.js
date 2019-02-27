'use strict';

const CHR = String.fromCharCode;

const u8 = new Uint8Array(8);
const f32 = new Float32Array(1);
const f64 = new Float64Array(1);
const u64 = new BigUint64Array(1);
const i64 = new BigInt64Array(1);

module.exports = {
  CHR,
  f32,
  f64,
  i64,
  u64,
  u8,
};

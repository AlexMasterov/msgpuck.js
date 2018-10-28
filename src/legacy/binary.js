'use strict';

const CHR = require('ascii-chr');
const FastBuffer = Buffer[Symbol.species];

const f32 = new Float32Array(1);
const f64 = new Float64Array(1);

module.exports = {
  CHR,
  FastBuffer,
  f32,
  f64,
};

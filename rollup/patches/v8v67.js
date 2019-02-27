'use strict';

const removeUint8 = code => code
  .replace(/([\s])+const u8[^;]+;/, '$1')
  .replace(/[\s]+u8,?/, '');

const viewToUint8 = code => code
  .replace(/([,\s])u8(,?)/, '$1f64$2')
  .replace(/const vu8 = [^;]+;/, 'const u8f64 = new Uint8Array(f64.buffer);')
  .replace(/vu8.setFloat(32|64)[^;]+;/g, 'f$1[0] = num;')
  .replace(/([\[(]u8)\[(.+)\]/g, (_, type, idx) => {
    const flipIdx = idx - (idx + 1) & 7;
    return `${type}f64[${flipIdx}]`;
  });

// v8v67
module.exports = {
  'binary.js': [removeUint8],
  'encoders/selectEncoderFloat.js': [viewToUint8],
};

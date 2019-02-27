'use strict';

const V8v67 = require('./V8v67');

const charCodeToCHR = code => code
  .replace(/(const CHR) = [^;]+;/, `$1 = require('ascii-chr')`)
  .replace(/(CHR)\((.+)\)/g, '$1[$2]');

// binary
const removeBigIntArray = code => code
  .replace(/\s+const (u|i)64[^;]+;/g, '')
  .replace(/[\s]+(u|i)64,?/g, '');

// Encoder
const removeBigInt = code => code
  .replace(/\s+case BigNum[^;]+/, '')
// encodeBigInt => encodeInt
  .replace(/\s+encodeBigInt\(.+[^}]+}[^}]+}/, '')
  .replace(/(\s+this.encodeFloat[^;]+;)/, '$1\r\n    this.encodeBigInt = this.encodeInt;')
// types
  .replace(/,?[\s]+(u|i)64,?/g, '')
  .replace(/\s+const (u|i)8(u|i)64[^;]+;/g, '');

// v8v62
module.exports = {
  'Encoder.js': [charCodeToCHR],
  'binary.js': [
    ...V8v67['binary.js'],
    charCodeToCHR,
    removeBigIntArray,
  ],
  'encoders/encodeAscii.js': [charCodeToCHR],
  'encoders/encodeInt64.js': [charCodeToCHR],
  'encoders/encodeMapHeader.js': [charCodeToCHR],
  'encoders/selectEncoderFloat.js': [
    ...V8v67['encoders/selectEncoderFloat.js'],
    charCodeToCHR,
  ],
};

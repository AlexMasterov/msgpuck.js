'use strict';
/* istanbul ignore file */

const Float = require('./float');

const hasBigInt = global.BigInt !== void 0;

function selectEncoderFloat(type) {
  if (type === '64') return Float.encodeFloat64;
  if (type === '32') return Float.encodeFloat32;
  return Float.encodeFloat;
}

function encodeIntOverflow(num) {
  return num > 0x1fffffffffffff
    ? '\xcf\x00\x20\x00\x00\x00\x00\x00\x00' // Infinity
    : '\xd3\xff\xdf\xff\xff\xff\xff\xff\xff'; // -Infinity
}

function getEncoderInt64() {
  return hasBigInt
    ? require('./bigint64').encodeBigInt
    : encodeIntOverflow;
}

function getDecoderUint64() {
  return hasBigInt
    ? require('./bigint64').decodeBigUint64
    : require('./int64').decodeUint64;
}

function getDecoderInt64() {
  return hasBigInt
    ? require('./bigint64').decodeBigInt64
    : require('./int64').decodeInt64;
}

module.exports = class Methods {
  static get selectEncoderFloat() { return selectEncoderFloat; }
  static get getEncoderInt64() { return getEncoderInt64; }
  static get getDecoderInt64() { return getDecoderInt64; }
  static get getDecoderUint64() { return getDecoderUint64; }
};

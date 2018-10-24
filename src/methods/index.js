'use strict';
/* istanbul ignore file */

const {
  decodeInt64,
  decodeUint64,
  encodeBigInt,
} = global.BigInt ? require('./bigint') : require('./int64');

module.exports = class Methods {
  static get selectEncoderFloat() { return require('./float'); }
  static get encodeBigInt() { return encodeBigInt; }
  static get decodeInt64() { return decodeInt64; }
  static get decodeUint64() { return decodeUint64; }
};

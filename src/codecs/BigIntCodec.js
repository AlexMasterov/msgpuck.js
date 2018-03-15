'use strict';

const Codec = require('../Codec');
const CanValueOf = require('./capability/CanValueOf');

let BigIntValueOf;

try {
  BigIntValueOf = BigInt.prototype.valueOf;
} catch (e) {}

class BigIntCodec extends CanValueOf(Codec) {
  static get type() {
    return 0x04;
  }

  supports(value) {
    return value instanceof BigInt;
  }

  encode(value) {
    return BigIntValueOf.call(value);
  }

  decode(data) {
    return this.valueOf ? data : new BigInt(data);
  }
}

module.exports = BigIntCodec;

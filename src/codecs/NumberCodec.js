'use strict';

const Codec = require('../Codec');
const CanValueOf = require('./capability/CanValueOf');

const NumberValueOf = Number.prototype.valueOf;

class NumberCodec extends CanValueOf(Codec) {
  static get type() {
    return 0x02;
  }

  supports(value) {
    return value.constructor === Number;
  }

  encode(value) {
    return NumberValueOf.call(value);
  }

  decode(value) {
    return this.valueOf ? value : new Number(value);
  }
}

module.exports = NumberCodec;

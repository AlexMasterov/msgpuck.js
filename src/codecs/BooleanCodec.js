'use strict';

const Codec = require('../Codec');
const CanValueOf = require('./capability/CanValueOf');

const BooleanValueOf = Boolean.prototype.valueOf;

class BooleanCodec extends CanValueOf(Codec) {
  static get type() {
    return 0x01;
  }

  supports(value) {
    return value.constructor === Boolean;
  }

  encode(value) {
    return BooleanValueOf.call(value);
  }

  decode(value) {
    return this.valueOf ? value : new Boolean(value);
  }
}

module.exports = BooleanCodec;

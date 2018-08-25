'use strict';

const Codec = require('../Codec');
const CanValueOf = require('./capability/CanValueOf');

const StringValueOf = String.prototype.valueOf;

class StringCodec extends CanValueOf(Codec) {
  static get type() {
    return 0x03;
  }

  supports(value) {
    return value.constructor === String;
  }

  encode(value) {
    return StringValueOf.call(value);
  }

  decode(data) {
    return this.valueOf ? data : new String(data);
  }
}

module.exports = StringCodec;

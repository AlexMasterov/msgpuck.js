'use strict';

const toString = String.prototype.toString;
const booleanValueOf = Boolean.prototype.valueOf;

class ScalarObjectCodec {
  encode(encoder, value) {
    switch (value.constructor) {
      case Number: return encoder.encodeInt(value);
      case String: return encoder.encodeStr(toString.call(value));
      case Boolean: return booleanValueOf.call(value) ? '\xc3' : '\xc2';
      default: return null;
    }
  }
}

module.exports = ScalarObjectCodec;

'use strict';

const Codec = require('../Codec');
const CanWithFor = require('./capability/CanWithFor');

const SymbolToString = Symbol.prototype.toString;

class SymbolCodec extends CanWithFor(Codec) {
  static get type() {
    return 0x0a;
  }

  supports(value) {
    return typeof value === 'symbol';
  }

  encode(encoder, value) {
    // Symbol(value) => value
    return encoder.encodeStr(SymbolToString.call(value).slice(7, -1));
  }

  decode(decoder, length) {
    return this.withFor
      ? Symbol.for(decoder.parse())
      : Symbol(decoder.parse());
  }
}

module.exports = SymbolCodec;

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

  encode(value) {
    // Symbol(value) => value
    return SymbolToString.call(value).slice(7, -1);
  }

  decode(value) {
    return this.withFor ? Symbol.for(value) : Symbol(value);
  }
}

module.exports = SymbolCodec;

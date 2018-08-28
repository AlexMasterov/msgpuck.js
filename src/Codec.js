'use strict';

class Codec {
  static make(type) {
    return new this(type);
  }

  static get type() {
    return 0x00;
  }

  constructor(type = new.target.type) {
    this.type = type;
  }

  supports(value) {
    throw new Error('The supports() method not implemented');
  }

  encode(value) {
    throw new Error('The encode() method not implemented');
  }

  decode(value) {
    throw new Error('The decode() method not implemented');
  }
}

module.exports = Codec;

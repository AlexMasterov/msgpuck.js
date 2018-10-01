'use strict';

class Codec {
  static get type() {
    return 0x00;
  }

  static make(type) {
    return new this(type);
  }

  constructor(type = new.target.type) {
    this.type = type;
  }
}

module.exports = Codec;

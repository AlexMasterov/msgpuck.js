'use strict';

class Codec {
  static get type() {
    return 0x00;
  }

  constructor(type = new.target.type) {
    this.type = type;
  }
}

module.exports = Codec;

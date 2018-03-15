'use strict';

const Codec = require('../Codec');

class MapCodec extends Codec {
  static get type() {
    return 0x0c;
  }

  supports(value) {
    return value.constructor === Map;
  }

  encode(value) {
    return [...value];
  }

  decode(data) {
    return new Map(data);
  }
}

module.exports = MapCodec;

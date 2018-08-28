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
    const array = new Array(value.size);

    let i = 0;
    for (const arr of value) {
      array[i++] = arr;
    }

    return array;
  }

  decode(value) {
    return new Map(value);
  }
}

module.exports = MapCodec;

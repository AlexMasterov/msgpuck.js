'use strict';

const CanWithFor = Codec => class extends Codec {
  static withFor(type) {
    const codec = new this(type);

    codec.withFor = true;

    return codec;
  }

  constructor(type) {
    super(type);

    this.withFor = false;
  }
};

module.exports = CanWithFor;

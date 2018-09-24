'use strict';

const CanValueOf = Codec => class extends Codec {
  static withValueOf(type) {
    const canValueOf = new this(type);

    canValueOf.valueOf = true;

    return canValueOf;
  }

  constructor(type) {
    super(type);

    this.valueOf = false;
  }
};

module.exports = CanValueOf;

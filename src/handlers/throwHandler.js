'use strict';

const { DecodingFailed, InsufficientData } = require('../errors');

function throwHandler(byte, expectedLength) {
  if (byte === 0xc1) {
    if (this.length === 0) {
      throw DecodingFailed.noData();
    }

    throw DecodingFailed.fromOffset(this.offset);
  }

  throw InsufficientData.unexpectedLength(expectedLength, this.length - this.offset);
}

module.exports = throwHandler;

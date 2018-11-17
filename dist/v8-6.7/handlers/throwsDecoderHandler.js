'use strict';

const { DecodingFailed, InsufficientData } = require('../errors');

function throwsDecoderHandler(expectedLength) {
  if (expectedLength === 0) {
    throw DecodingFailed.fromOffset(this.offset);
  }

  throw InsufficientData.unexpectedLength(expectedLength, this.length - this.offset);
}

module.exports = throwsDecoderHandler;

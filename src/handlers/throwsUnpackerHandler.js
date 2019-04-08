'use strict';

const { PackingFailed, InsufficientData } = require('../errors');

function throwsUnpackerHandler(expectedLength) {
  if (expectedLength === 0) {
    throw PackingFailed.fromOffset(this.offset);
  }

  throw InsufficientData.unexpectedLength(expectedLength, this.length - this.offset);
}

module.exports = throwsUnpackerHandler;

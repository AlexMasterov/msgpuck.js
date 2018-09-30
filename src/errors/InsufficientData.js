'use strict';

const DecodingFailed = require('./DecodingFailed');

class InsufficientData extends DecodingFailed {
  static unexpectedLength(expected, actual) {
    return new this(`Not enough data to decode: expected length ${expected}, got ${actual}`);
  }
}

module.exports = InsufficientData;

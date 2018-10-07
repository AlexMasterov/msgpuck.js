'use strict';

const { EncodingFailed } = require('../errors');

function throwsEncoderHandler(value) {
  throw EncodingFailed.withValue(value);
}

module.exports = throwsEncoderHandler;

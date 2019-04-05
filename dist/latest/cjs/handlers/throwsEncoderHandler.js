'use strict';

const { EncodingFailed } = require('../errors');

const throwsEncoderHandler = (value) => {
  throw EncodingFailed.withValue(value);
};

module.exports = throwsEncoderHandler;

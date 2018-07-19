'use strict';

const MsgPackError = require('../MsgPackError');

class EncodingFailed extends MsgPackError {
  static withValue(value) {
    const message = `Could not encode: ${value} (${typeof value})`;

    return new this(value, message);
  }
}

module.exports = EncodingFailed;

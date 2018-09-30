'use strict';

const MsgPackError = require('../MsgPackError');

class EncodingFailed extends MsgPackError {
  static withValue(value) {
    return new this(`Could not encode: ${value} (${typeof value})`, value);
  }
}

module.exports = EncodingFailed;

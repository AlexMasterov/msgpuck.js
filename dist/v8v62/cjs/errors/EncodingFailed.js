'use strict';

const MsgPackError = require('./MsgPackError');

class EncodingFailed extends MsgPackError {
  static withValue(value) {
    return new this(`Could not encode: ${typeof value}`);
  }
}

module.exports = EncodingFailed;

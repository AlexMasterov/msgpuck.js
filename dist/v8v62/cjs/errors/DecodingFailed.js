'use strict';

const MsgPackError = require('./MsgPackError');

class DecodingFailed extends MsgPackError {
  static fromOffset(offset) {
    return new this(`Cannot decode data with byte-header in position ${offset}`);
  }
}

module.exports = DecodingFailed;

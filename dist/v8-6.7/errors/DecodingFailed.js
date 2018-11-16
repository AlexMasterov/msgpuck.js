'use strict';

const MsgPackError = require('./MsgPackError');

class DecodingFailed extends MsgPackError {
  static noData() {
    return new this('No data to decode');
  }

  static fromOffset(offset) {
    return new this(`Cannot decode data with byte-header in position ${offset}`);
  }
}

module.exports = DecodingFailed;

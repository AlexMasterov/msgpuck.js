'use strict';

const MsgPackError = require('../MsgPackError');

function decToHex(num) {
  return (num | 0x10000).toString(16).slice(-2);
}

class DecodingFailed extends MsgPackError {
  static fromOffset(byte, offset) {
    const message = `Can't decode data with byte-header ${decToHex(byte)} in position ${offset}`;

    return new this(byte, message);
  }
}

module.exports = DecodingFailed;

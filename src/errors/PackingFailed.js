'use strict';

const MsgPackError = require('./MsgPackError');

class PackingFailed extends MsgPackError {
  static withValue(value) {
    return new this(`Could not encode: ${typeof value}`);
  }
}

module.exports = PackingFailed;

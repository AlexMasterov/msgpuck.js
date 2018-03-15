'use strict';

const DecodingFailed = require('./DecodingFailed');

class InsufficientData extends DecodingFailed {
  static fromOffset(data, offset, expectedLength) {
    const actualLength = data.length - offset;
    const message = `Not enough data to decode: expected length ${expectedLength}, got ${actualLength}`;

    return new InsufficientData(data, message);
  }
}

module.exports = InsufficientData;

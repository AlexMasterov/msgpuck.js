'use strict';
/* istanbul ignore file */

module.exports = class Long {
  static get LongCodec() { return require('./LongCodec'); }
  static get decodeLong() { return require('./decodeLong'); }
};

module.exports = Long;

'use strict';
/* istanbul ignore file */

const Long = require('long');

function decodeLong() {
  if (this.length < this.offset + 8) {
    return this.unexpectedLength(8);
  }

  const num = new Long(
    this.buffer[this.offset] << 24
    | this.buffer[this.offset + 1] << 16
    | this.buffer[this.offset + 2] << 8
    | this.buffer[this.offset + 3],
    this.buffer[this.offset + 4] << 24
    | this.buffer[this.offset + 5] << 16
    | this.buffer[this.offset + 6] << 8
    | this.buffer[this.offset + 7]
  );

  this.offset += 8;

  return num;
}

module.exports = decodeLong;

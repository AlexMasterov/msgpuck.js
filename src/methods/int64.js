'use strict';

function decodeUint64() {
  if (this.length < this.offset + 8) {
    return this.handler(0xcf, 8);
  }

  const num = this.buffer[this.offset] * 0x1000000
    + (this.buffer[this.offset + 1] << 16
      | this.buffer[this.offset + 2] << 8
      | this.buffer[this.offset + 3]) * 0x100000000
    + this.buffer[this.offset + 4] * 0x1000000
    + (this.buffer[this.offset + 5] << 16
      | this.buffer[this.offset + 6] << 8
      | this.buffer[this.offset + 7]);

  this.offset += 8;

  return num;
}

function decodeInt64() {
  if (this.length < this.offset + 8) {
    return this.handler(0xd3, 8);
  }

  const num = (this.buffer[this.offset] << 24
    | this.buffer[this.offset + 1] << 16
    | this.buffer[this.offset + 2] << 8
    | this.buffer[this.offset + 3]) * 0x100000000
    + this.buffer[this.offset + 4] * 0x1000000
    + (this.buffer[this.offset + 5] << 16
      | this.buffer[this.offset + 6] << 8
      | this.buffer[this.offset + 7]);

  this.offset += 8;

  return num;
}

module.exports = class Int64 {
  static get decodeInt64() { return decodeInt64; }
  static get decodeUint64() { return decodeUint64; }
};

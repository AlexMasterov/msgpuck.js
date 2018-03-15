'use strict';

const { fill: bufFill } = process.binding('buffer');
const Ext = require('../../src/Ext');

const FastBuffer = Buffer[Symbol.species];

const NUM = 0;
const CHAR = 'a';

class JavaScript {
  static make(...args) {
    return new JavaScript(...args);
  }

  constructor(str = 256, arr = 256, buf = 256) {
    this.s = CHAR.repeat(str);
    this.a = Array.from(new Array(arr).fill(NUM));
    this.b = new FastBuffer(buf);
    bufFill(this.b, CHAR, 0, buf, 'binary');
  }

  str(len) {
    const diff = len - this.s.length;
    return diff < 0
      ? this.s.slice(0, diff)
      : this.s += CHAR.repeat(diff);
  }

  bin(len) {
    const diff = len - this.b.length;
    if (diff === 0) return this.b;
    if (diff < 0) return this.b.slice(0, diff);
    this.b = new FastBuffer(len);
    bufFill(this.b, CHAR, 0, len, 'binary');
    return this.b;
  }

  arr(len) {
    const diff = len - this.a.length;
    return diff < 0
      ? this.a.slice(0, diff)
      : this.a = this.a.concat(new Array(diff).fill(NUM));
  }

  obj(len) {
    return { ...this.arr(len) };
  }

  map(size) {
    return new Map(this.arr(size).map((k, v) => [String(v), k]));
  }

  ext(type, len = 0) {
    return new Ext(type, this.str(len));
  }
}

module.exports = JavaScript;

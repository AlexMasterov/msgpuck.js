'use strict';

const { Ext } = require('../../');

function byte() {
  return Buffer.from(arguments);
}

const byteN = (value, repeat) => Buffer.allocUnsafe(repeat).fill(value);
const byteStrN = (value, length) => {
  let i = 0, key, data = '';
  while (i < length) {
    key = String(i);
    data += String.fromCharCode(key.length | 0xa0) + key + value;
    i += 1;
  }
  return Buffer.from(data, 'binary');
};

const ext = (type, bin) => new Ext(type, bin);
const strN = (value, repeat) => value.repeat(repeat);
const arrN = (value, repeat) => new Array(repeat).fill(value);
const mapN = (value, repeat) => new Map(arrN(value, repeat).map((k, v) => [String(v), k]));
const objN = (value, size) => {
  const obj = {};
  while (size > 0) obj[size -= 1] = value;
  return obj;
};

module.exports = {
  arrN,
  byte,
  byteN,
  byteStrN,
  ext,
  mapN,
  objN,
  strN,
};

'use strict';

const { utf8toBin, CHR } = require('../../src/optimizers');
const Ext = require('../../src/Ext');

const bytes = (...bytes) => Buffer.from(bytes);
const bytesN = (value, repeat) => Buffer.allocUnsafe(repeat).fill(value);
const bytesStrN = (value, length, data='') => {
  for (let key, i = 0; i < length; i++) {
    key = utf8toBin(String(i));
    data += CHR[key.length | 0xa0] + key + value;
  }
  return Buffer.from(data, 'binary');
};

const strN = (value, repeat) => value.repeat(repeat);
const arrN = (value, repeat) => new Array(repeat).fill(value);
const mapN = (value, repeat) => new Map(arrN(value, repeat).map((k, v) => [String(v), k]));
const objN = (value, size, obj = {}) => {
  while (--size >= 0) obj[size] = value;
  return obj;
};

const ext = (type, value) => new Ext(type, value);

module.exports = {
  bytes,
  bytesN,
  bytesStrN,
  strN,
  arrN,
  mapN,
  objN,
  ext,
};

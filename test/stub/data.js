'use strict';

const CHR = require('ascii-chr');
const { utf8toBin } = require('utf8-binary');

const Ext = require('../../src/Ext');

const byte = (...bytes) => Buffer.from(bytes);
const byteN = (value, repeat) => Buffer.allocUnsafe(repeat).fill(value);
const byteStrN = (value, length) => {
  let data = '';
  for (let key, i = 0; i < length; i++) {
    key = utf8toBin(String(i));
    data += CHR[key.length | 0xa0] + key + value;
  }
  return Buffer.from(data, 'binary');
};

const bint = global.BigInt ? global.BigInt : Number;
const strN = (value, repeat) => value.repeat(repeat);
const arrN = (value, repeat) => new Array(repeat).fill(value);
const mapN = (value, repeat) => new Map(arrN(value, repeat).map((k, v) => [String(v), k]));
const objN = (value, size) => {
  const obj = {};
  while (size > 0) obj[size -= 1] = value;
  return obj;
};

const ext = (type, bin) => new Ext(type, bin);

module.exports = {
  arrN,
  bint,
  byte,
  byteN,
  byteStrN,
  ext,
  mapN,
  objN,
  strN,
};

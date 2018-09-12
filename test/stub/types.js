'use strict';

const { utf8toBin, CHR } = require('../../src/optimizers');
const Ext = require('../../src/Ext');

const ext = (type, value) => new Ext(type, value);
const bytes = (...bytes) => Uint8Array.from(bytes);
const bytesN = (value, repeat) => Buffer.allocUnsafe(repeat).fill(value);
const bytesStrN = (value, increment) => {
  let data = '';
  for (let key, i = 0; i < increment; i++) {
    key = utf8toBin(String(i));
    data += CHR[key.length | 0xa0] + key + value;
  }
  return Buffer.from(data, 'binary');
};
const strN = (value, repeat) => value.repeat(repeat);
const arrN = (value, repeat) => new Array(repeat).fill(value);
const mapN = (value, repeat) => new Map(arrN(value, repeat).map((k, v) => [String(v), k]));
const objN = (value, increment, obj = {}) => {
  while (--increment >= 0) obj[increment] = value;
  return obj;
};

const types = {
  'null c0': [
    { name: 'null', value: null, bin: bytes(0xc0) },
  ],
  'boolean c2/c3': [
    { name: 'false', value: false, bin: bytes(0xc2) },
    { name: 'true', value: true, bin: bytes(0xc3) },
  ],
  'float32 ca': [
    { name: '-Infinity', value: -Infinity, bin: bytes(0xca, 0xff, 0x80, 0x00, 0x00) },
    { name: 'Infinity', value: Infinity, bin: bytes(0xca, 0x7f, 0x80, 0x00, 0x00) },
    { name: 'NaN', value: NaN, bin: bytes(0xca, 0x7f, 0xc0, 0x00, 0x00) },
  ],
  'float64 cb': [
    { name: '-Infinity', value: -Infinity, bin: bytes(0xcb, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00) },
    { name: 'Infinity', value: Infinity, bin: bytes(0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00) },
    { name: 'NaN', value: NaN, bin: bytes(0xcb, 0x7f, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00) },
  ],
  'int -Infinity cb': [
    { name: 'MIN_SAFE_INTEGER - 1', value: Number.MIN_SAFE_INTEGER - 1,
      bin: bytes(0xcb, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00) },
  ],
  'uint Infinity cb': [
    { name: 'MAX_SAFE_INTEGER + 1', value: Number.MAX_SAFE_INTEGER + 1,
      bin: bytes(0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00) },
  ],
  'int5 ff-e0': [
    { name: 'min (-32)', value: -32, bin: bytes(0xe0) },
    { name: 'max (-1)', value: -1, bin: bytes(0xff) },
  ],
  'int8 d0': [
    { name: 'min (-128)', value: -128, bin: bytes(0xd0, 0x80) },
    { name: 'max (-33)', value: -33, bin: bytes(0xd0, 0xdf) },
  ],
  'int16 d1': [
    { name: 'min (-32768)', value: -32768, bin: bytes(0xd1, 0x80, 0x00) },
    { name: 'max (-129)', value: -129, bin: bytes(0xd1, 0xff, 0x7f) },
  ],
  'int32 d2': [
    { name: 'min (-2147483648)', value: -2147483648, bin: bytes(0xd2, 0x80, 0x00, 0x00, 0x00) },
    { name: 'max (-32769)', value: -32769, bin: bytes(0xd2, 0xff, 0xff, 0x7f, 0xff) },
  ],
  'int64 d3': [
    { name: 'min safe integer', value: -Number.MAX_SAFE_INTEGER,
      bin: bytes(0xd3, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01) },
  ],
  'uint5 00-7f': [
    { name: 'min (0)', value: 0, bin: bytes(0x00) },
    { name: 'max (127)', value: 127, bin: bytes(0x7f) },
  ],
  'uint8 cc': [
    { name: 'min (128)', value: 128, bin: bytes(0xcc, 0x80) },
    { name: 'max (255)', value: 255, bin: bytes(0xcc, 0xff) },
  ],
  'uint16 cd': [
    { name: 'min (256)', value: 256, bin: bytes(0xcd, 0x01, 0x00) },
    { name: 'max (65535)', value: 65535, bin: bytes(0xcd, 0xff, 0xff) },
  ],
  'uint32 ce': [
    { name: 'min (65536)', value: 65536, bin: bytes(0xce, 0x00, 0x01, 0x00, 0x00) },
    { name: 'max (4294967295)', value: 4294967295, bin: bytes(0xce, 0xff, 0xff, 0xff, 0xff) },
  ],
  'uint64 cf': [
    { name: 'max safe integer', value: Number.MAX_SAFE_INTEGER,
      bin: bytes(0xcf, 0x00, 0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff) },
  ],
  'str5 a0-bf': [
    { name: 'min (0)', value: '', bin: bytes(0xa0) },
    { name: 'max (31)', value: strN('a', 31), bin: bytes(0xbf, ...bytesN(0x61, 31)) },
  ],
  'str8 d9': [
    { name: 'min (32)', value: strN('a', 32), bin: bytes(0xd9, 0x20, ...bytesN(0x61, 32)) },
    { name: 'max (255)', value: strN('a', 255), bin: bytes(0xd9, 0xff, ...bytesN(0x61, 255)) },
  ],
  'str16 da': [
    { name: 'min (256)', value: strN('a', 256), bin: bytes(0xda, 0x01, 0x00, ...bytesN(0x61, 256)) },
    { name: 'max (65535)', value: strN('a', 65535), bin: bytes(0xda, 0xff, 0xff, ...bytesN(0x61, 65535)) },
  ],
  'str32 db': [
    { name: 'max (65536)', value: strN('a', 65536),
      bin: bytes(0xdb, 0x00, 0x01, 0x00, 0x00, ...bytesN(0x61, 65536)) },
  ],
  'utf8 a1/a2/a3/a4': [
    // 1 byte
    { name: '1 byte (u0000)', value: '\u0000', bin: bytes(0xa1, 0x00) },
    { name: '1 byte (u007f)', value: '\u007f', bin: bytes(0xa1, 0x7f) },
    // 2 bytes
    { name: '2 byte (u0080)', value: '\u0080', bin: bytes(0xa2, 0xc2, 0x80) },
    { name: '2 byte (u07ff)', value: '\u07ff', bin: bytes(0xa2, 0xdf, 0xbf) },
    // 3 bytes
    { name: '3 byte (u0800)', value: '\u0800', bin: bytes(0xa3, 0xe0, 0xa0, 0x80) },
    { name: '3 byte (uffff)', value: '\uffff', bin: bytes(0xa3, 0xef, 0xbf, 0xbf) },
    // 4 bytes
    { name: '4 byte (u010000)', value: '\u010000', bin: bytes(0xa4, 0xc4,0x80, 0x30, 0x30) },
    { name: '4 byte (u10fff)', value: '\u10fff', bin: bytes(0xa4, 0xe1, 0x83,0xbf, 0x66) },
  ],
  'bin8 c4': [
    { name: 'min (0)', value: Buffer.allocUnsafe(0), bin: bytes(0xc4, 0x00) },
    { name: 'opt (6)', value: bytesN(1, 6), bin: bytes(0xc4, 0x06, ...bytesN(1, 6)) },
    { name: 'max (255)', value: bytesN(1, 255), bin: bytes(0xc4, 0xff, ...bytesN(1, 255)) },
  ],
  'bin16 c5': [
    { name: 'min (256)', value: bytesN(1, 256), bin: bytes(0xc5, 0x01, 0x00, ...bytesN(1, 256)) },
    { name: 'max (65535)', value: bytesN(1, 65535), bin: bytes(0xc5, 0xff, 0xff, ...bytesN(1, 65535)) },
  ],
  'bin32 c6': [
    { name: 'min (65536)', value: bytesN(1, 65536),
      bin: bytes(0xc6, 0x00, 0x01, 0x00, 0x00, ...bytesN(1, 65536)) },
  ],
  'fixarr 90-9f': [
    { name: 'min (0)', value: new Array(0), bin: bytes(0x90) },
    { name: 'min (15)', value: arrN(1, 15), bin: bytes(0x9f, ...bytesN(0x01, 15)) },
  ],
  'arr16 dc': [
    { name: 'min (16)', value: arrN(1, 16), bin: bytes(0xdc, 0x00, 0x10, ...bytesN(0x01, 16)) },
    { name: 'min (65535)', value: arrN(1, 65535), bin: bytes(0xdc, 0xff, 0xff, ...bytesN(0x01, 65535)) },
  ],
  'arr32 dd': [
    { name: 'min (65536)', value: arrN(1, 65536),
      bin: bytes(0xdd, 0x00, 0x01, 0x00, 0x00, ...bytesN(0x01, 65536)) },
  ],
  'fixmap 80-8f': [
    { name: 'min (0)', value: {}, bin: bytes(0x80) },
    { name: 'min (15)', value: objN(1, 15), bin: bytes(0x8f, ...bytesStrN('\x01', 15)) },
  ],
  'map16 de': [
    { name: 'min (16)', value: objN(1, 16),
      bin: bytes(0xde, 0x00, 0x10, ...bytesStrN('\x01', 16)) },
    { name: 'min (65535)', value: objN(1, 65535),
      bin: Buffer.from([0xde, 0xff, 0xff, ...bytesStrN('\x01', 65535)]) },
  ],
  'map32 df': [
    { name: 'min (65536)', value: objN(1, 65536),
      bin: Buffer.from([0xdf, 0x00, 0x01, 0x00, 0x00, ...bytesStrN('\x01', 65536)]) },
  ],
  'fixmap 80-8f (Map)': [
    { name: 'min (0)', value: new Map(), bin: bytes(0x80) },
    { name: 'min (15)', value: mapN(1, 15), bin: bytes(0x8f, ...bytesStrN('\x01', 15)) },
  ],
  'map16 de (Map)': [
    { name: 'min (16)', value: mapN(1, 16),
      bin: bytes(0xde, 0x00, 0x10, ...bytesStrN('\x01', 16)) },
    { name: 'min (65535)', value: mapN(1, 65535),
      bin: Buffer.from([0xde, 0xff, 0xff, ...bytesStrN('\x01', 65535)]) },
  ],
  'map32 df (Map)': [
    { name: 'min (65536)', value: mapN(1, 65536),
      bin: Buffer.from([0xdf, 0x00, 0x01, 0x00, 0x00, ...bytesStrN('\x01', 65536)]) },
  ],
  'fixext d4/d5/d6/d7/d8': [
    { name: '1', value: ext(1, 'a'), bin: bytes(0xd4, 0x01, 0xa1, 0x61) },
    { name: '2', value: ext(1, strN('a', 2)), bin: bytes(0xd5, 0x01, 0xa2, ...bytesN(0x61, 2)) },
    { name: '4', value: ext(1, strN('a', 4)), bin: bytes(0xd6, 0x01, 0xa4, ...bytesN(0x61, 4)) },
    { name: '8', value: ext(1, strN('a', 8)), bin: bytes(0xd7, 0x01, 0xa8, ...bytesN(0x61, 8)) },
    { name: '16', value: ext(1, strN('a', 16)), bin: bytes(0xd8, 0x01, 0xb0, ...bytesN(0x61, 16)) },
  ],
  // trim (1) type byte
  'ext8 c7': [
    { name: 'min (17)', value: ext(1, strN('a', 17)),
      bin: bytes(0xc7, 0x11, 0x01, 0xb1, ...bytesN(0x61, 17)) },
    { name: 'max (254)', value: ext(1, strN('a', 254)),
      bin: bytes(0xc7, 0xff, 0x01, 0xd9, 0xfe, ...bytesN(0x61, 254)) },
  ],
  'ext16 c8': [
    { name: 'min (255)', value: ext(1, strN('a', 255)),
      bin: bytes(0xc8, 0x01, 0x00, 0x01, 0xd9, 0xff, ...bytesN(0x61, 255)) },
    { name: 'max (65533)', value: ext(1, strN('a', 65533)),
      bin: bytes(0xc8, 0xff, 0xff, 0x01, 0xda, 0xff, 0xfd, ...bytesN(0x61, 65533)) },
  ],
  'ext32 c9': [
    { name: 'max (65534)', value: ext(1, strN('a', 65534)),
      bin: bytes(0xc9, 0x00, 0x01, 0x00, 0x00, 0x01, 0xda, 0xff, 0xfe, ...bytesN(0x61, 65534)) },
  ],
};

module.exports = types;

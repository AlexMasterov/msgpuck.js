'use strict';

const { bytes, bytesStrN, strN, bytesN, arrN, objN, mapN, ext } = require('./data');

const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;
const MIN_SAFE_INT = Number.MIN_SAFE_INTEGER;

const type = (name, value, bytes) => ({ name, value, bin: bytes });

const types = {
  'null': [
    type('null', null, bytes(0xc0)),
  ],

  'boolean': [
    type('false', false, bytes(0xc2)),
    type('true', true, bytes(0xc3)),
  ],

  'float32': [
    type('-Infinity', -Infinity, bytes(0xca, 0xff, 0x80, 0x00, 0x00)),
    type('Infinity', Infinity, bytes(0xca, 0x7f, 0x80, 0x00, 0x00)),
    type('NaN', NaN, bytes(0xca, 0x7f, 0xc0, 0x00, 0x00)),
  ],
  'float64': [
    type('-Infinity', -Infinity, bytes(0xcb, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
    type('Infinity', Infinity, bytes(0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
    type('NaN', NaN, bytes(0xcb, 0x7f, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
  ],

  'fixint': [
    type('min (0)', 0, bytes(0x00)),
    type('max (127)', 127, bytes(0x7f)),
  ],
  'uint8': [
    type('min (128)', 128, bytes(0xcc, 0x80)),
    type('max (255)', 255, bytes(0xcc, 0xff)),
  ],
  'uint16': [
    type('min (256)', 256, bytes(0xcd, 0x01, 0x00)),
    type('max (65535)', 65535, bytes(0xcd, 0xff, 0xff)),
  ],
  'uint32': [
    type('min (65536)', 65536, bytes(0xce, 0x00, 0x01, 0x00, 0x00)),
    type('max (4294967295)', 4294967295, bytes(0xce, 0xff, 0xff, 0xff, 0xff)),
  ],
  'uint64': [
    type('max (9007199254740991)', MAX_SAFE_INT, bytes(0xcf, 0x00, 0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)),
    type('overflow (9007199254740992)', MAX_SAFE_INT+1, bytes(0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
  ],

  '-fixint': [
    type('min (-32)', -32, bytes(0xe0)),
    type('max (-1)', -1, bytes(0xff)),
  ],
  'int8': [
    type('min (-128)', -128, bytes(0xd0, 0x80)),
    type('max (-33)', -33, bytes(0xd0, 0xdf)),
  ],
  'int16': [
    type('min (-32768)', -32768, bytes(0xd1, 0x80, 0x00)),
    type('max (-129)', -129, bytes(0xd1, 0xff, 0x7f)),
  ],
  'int32': [
    type('min (-2147483648)', -2147483648, bytes(0xd2, 0x80, 0x00, 0x00, 0x00)),
    type('max (-32769)', -32769, bytes(0xd2, 0xff, 0xff, 0x7f, 0xff)),
  ],
  'int64': [
    type('max (-9007199254740991)', MIN_SAFE_INT, bytes(0xd3, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01)),
    type('overflow (-9007199254740992)', MIN_SAFE_INT-1, bytes(0xcb, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
  ],

  'fixstr': [
    type('min (0)', '', bytes(0xa0)),
    type('max (31)', strN('a', 31), bytes(0xbf, ...bytesN(0x61, 31))),
  ],
  'str8': [
    type('min (32)', strN('a', 32), bytes(0xd9, 0x20, ...bytesN(0x61, 32))),
    type('max (255)', strN('a', 255), bytes(0xd9, 0xff, ...bytesN(0x61, 255))),
  ],
  'str16': [
    type('min (256)', strN('a', 256), bytes(0xda, 0x01, 0x00, ...bytesN(0x61, 256))),
    type('max (65535)', strN('a', 65535), bytes(0xda, 0xff, 0xff, ...bytesN(0x61, 65535))),
  ],
  'str32': [
    type('max (65536)', strN('a', 65536), bytes(0xdb, 0x00, 0x01, 0x00, 0x00, ...bytesN(0x61, 65536))),
  ],

  'utf8': [
    type('1 byte (u0000)', '\u0000', bytes(0xa1, 0x00)),
    type('1 byte (u007f)', '\u007f', bytes(0xa1, 0x7f)),
    type('2 byte (u0080)', '\u0080', bytes(0xa2, 0xc2, 0x80)),
    type('2 byte (u07ff)', '\u07ff', bytes(0xa2, 0xdf, 0xbf)),
    type('3 byte (u0800)', '\u0800', bytes(0xa3, 0xe0, 0xa0, 0x80)),
    type('3 byte (uffff)', '\uffff', bytes(0xa3, 0xef, 0xbf, 0xbf)),
    type('4 byte (u10000)', '\u10000', bytes(0xa4, 0xe1, 0x80, 0x80, 0x30)),
    type('4 byte (u10ffff)', '\u10ffff', bytes(0xa5, 0xe1, 0x83,0xbf, 0x66, 0x66)),
  ],

  'bin8': [
    type('min (0)', bytes(), bytes(0xc4, 0x00)),
    type('opt (6)', bytesN(1, 6), bytes(0xc4, 0x06, ...bytesN(1, 6))),
    type('max (255)', bytesN(1, 255), bytes(0xc4, 0xff, ...bytesN(1, 255))),
  ],
  'bin16': [
    type('min (256)', bytesN(1, 256), bytes(0xc5, 0x01, 0x00, ...bytesN(1, 256))),
    type('max (65535)', bytesN(1, 65535), bytes(0xc5, 0xff, 0xff, ...bytesN(1, 65535))),
  ],
  'bin32': [
    type('min (65536)', bytesN(1, 65536), bytes(0xc6, 0x00, 0x01, 0x00, 0x00, ...bytesN(1, 65536))),
  ],

  'fixarr': [
    type('min (0)', [], bytes(0x90)),
    type('min (15)', arrN(1, 15), bytes(0x9f, ...bytesN(0x01, 15))),
  ],
  'arr16': [
    type('min (16)', arrN(1, 16), bytes(0xdc, 0x00, 0x10, ...bytesN(0x01, 16))),
    type('min (65535)', arrN(1, 65535), bytes(0xdc, 0xff, 0xff, ...bytesN(0x01, 65535))),
  ],
  'arr32': [
    type('min (65536)', arrN(1, 65536), bytes(0xdd, 0x00, 0x01, 0x00, 0x00, ...bytesN(0x01, 65536))),
  ],

  'fixmap obj': [
    type('min (0)', {}, bytes(0x80)),
    type('max (15)', objN(1, 15), bytes(0x8f, ...bytesStrN('\x01', 15))),
  ],
  'map16 obj': [
    type('min (16)', objN(1, 16), Buffer.from([0xde, 0x00, 0x10, ...bytesStrN('\x01', 16)])),
    type('max (65535)', objN(1, 65535), Buffer.from([0xde, 0xff, 0xff, ...bytesStrN('\x01', 65535)])),
  ],
  'map32 obj': [
    type('min (65536)', objN(1, 65536), Buffer.from([0xdf, 0x00, 0x01, 0x00, 0x00, ...bytesStrN('\x01', 65536)])),
  ],

  'fixmap map': [
    type('min (0)', new Map(), bytes(0x80)),
    type('max (15)', mapN(1, 15), Buffer.from([0x8f, ...bytesStrN('\x01', 15)])),
  ],
  'map16 map': [
    type('min (16)', mapN(1, 16), bytes(0xde, 0x00, 0x10, ...bytesStrN('\x01', 16))),
    type('min (65535)', mapN(1, 65535), Buffer.from([0xde, 0xff, 0xff, ...bytesStrN('\x01', 65535)])),
  ],
  'map32 map': [
    type('min (65536)', mapN(1, 65536), Buffer.from([0xdf, 0x00, 0x01, 0x00, 0x00, ...bytesStrN('\x01', 65536)])),
  ],

  'fixext': [
    type('1', ext(1, '\xc0'), bytes(0xd4, 0x01, 0xc0)),
    type('2', ext(1, strN('\xc0', 2)), bytes(0xd5, 0x01, ...bytesN(0xc0, 2))),
    type('4', ext(1, strN('\xc0', 4)), bytes(0xd6, 0x01, ...bytesN(0xc0, 4))),
    type('8', ext(1, strN('\xc0', 8)), bytes(0xd7, 0x01, ...bytesN(0xc0, 8))),
    type('16', ext(1, strN('\xc0', 16)), bytes(0xd8, 0x01, ...bytesN(0xc0, 16))),
  ],
  'ext8': [
    type('min (17)', ext(1, strN('\xc0', 17)), bytes(0xc7, 0x11, 0x01, ...bytesN(0xc0, 17))),
    type('max (255)', ext(1, strN('\xc0', 255)), bytes(0xc7, 0xff, 0x01, ...bytesN(0xc0, 255))),
  ],
  'ext16': [
    type('min (256)', ext(1, strN('\xc0', 256)), bytes(0xc8, 0x01, 0x00, 0x01, ...bytesN(0xc0, 256))),
    type('max (65535)', ext(1, strN('\xc0', 65535)), bytes(0xc8, 0xff, 0xff, 0x01, ...bytesN(0xc0, 65535))),
  ],
  'ext32': [
    type('max (65536)', ext(1, strN('\xc0', 65536)), bytes(0xc9, 0x00, 0x01, 0x00, 0x00, 0x01, ...bytesN(0xc0, 65536))),
  ],
};

module.exports = types;

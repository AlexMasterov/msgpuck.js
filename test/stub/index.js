'use strict';

const { arrN, bint, byte, byteN, byteStrN, ext, mapN, objN, strN } = require('./data');

const MIN_FLOAT32 = 1 / 2 ** (127 - 1);
const MIN_FLOAT64 = 2 ** -(1023 - 1);
const MIN_SAFE_INT = Number.MIN_SAFE_INTEGER;
const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;
const MIN_SAFE_INT_OVERFLOW = MIN_SAFE_INT - 1;
const MAX_SAFE_INT_OVERFLOW = MAX_SAFE_INT + 1;

const hasBigInt = global.BigInt !== void 0;
const type = (name, value, bin) => ({ name, value, bin });

const stub = {
  'nil': [
    type('null', null, byte(0xc0)),
  ],

  'boolean': [
    type('false', false, byte(0xc2)),
    type('true', true, byte(0xc3)),
  ],

  'float': [
    type('32 (1.1754943508222875e-38)', MIN_FLOAT32, byte(0xca, 0x00, 0x80, 0x00, 0x00)),
    type('64 (2.2250738585072014e-308)', MIN_FLOAT64, byte(0xcb, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
  ],
  'float32': [
    type('-Infinity', -Infinity, byte(0xca, 0xff, 0x80, 0x00, 0x00)),
    type('Infinity', Infinity, byte(0xca, 0x7f, 0x80, 0x00, 0x00)),
    type('NaN', NaN, byte(0xca, 0x7f, 0xc0, 0x00, 0x00)),
  ],
  'float64': [
    type('-Infinity', -Infinity, byte(0xcb, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
    type('Infinity', Infinity, byte(0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
    type('NaN', NaN, byte(0xcb, 0x7f, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
  ],

  'fixint': [
    type('min (0)', 0, byte(0x00)),
    type('max (127)', 127, byte(0x7f)),
  ],
  'uint8': [
    type('min (128)', 128, byte(0xcc, 0x80)),
    type('max (255)', 255, byte(0xcc, 0xff)),
  ],
  'uint16': [
    type('min (256)', 256, byte(0xcd, 0x01, 0x00)),
    type('max (65535)', 65535, byte(0xcd, 0xff, 0xff)),
  ],
  'uint32': [
    type('min (65536)', 65536, byte(0xce, 0x00, 0x01, 0x00, 0x00)),
    type('max (4294967295)', 4294967295, byte(0xce, 0xff, 0xff, 0xff, 0xff)),
  ],
  'uint64': [
    type('min (4294967296)', 4294967296, byte(0xcf, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00)),
    type('max (9007199254740991)', MAX_SAFE_INT, byte(0xcf, 0x00, 0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)),
    type('overflow (9007199254740992)', MAX_SAFE_INT_OVERFLOW, byte(0xcf, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
  ],

  '-fixint': [
    type('mmin (-1)', -1, byte(0xff)),
    type('max (-32)', -32, byte(0xe0)),
  ],
  'int8': [
    type('min (-33)', -33, byte(0xd0, 0xdf)),
    type('max (-128)', -128, byte(0xd0, 0x80)),
  ],
  'int16': [
    type('min (-129)', -129, byte(0xd1, 0xff, 0x7f)),
    type('max (-32768)', -32768, byte(0xd1, 0x80, 0x00)),
  ],
  'int32': [
    type('min (-32769)', -32769, byte(0xd2, 0xff, 0xff, 0x7f, 0xff)),
    type('max (-2147483648)', -2147483648, byte(0xd2, 0x80, 0x00, 0x00, 0x00)),
  ],
  'int64': [
    type('min (-2147483649)', -2147483649, byte(0xd3, 0xff, 0xff, 0xff, 0xff, 0x7f, 0xff, 0xff, 0xff)),
    type('max (-9007199254740991)', MIN_SAFE_INT, byte(0xd3, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01)),
    type('overflow (-9007199254740992)', MIN_SAFE_INT_OVERFLOW, byte(0xd3, 0xff, 0xdf, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)),
  ],

  'bigint': hasBigInt ? [
    type('min uint64 (0n)', bint('0'), byte(0xcf, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
    type('max uint64 (18446744073709551615n)', bint('18446744073709551615'), byte(0xcf, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)),
    type('max int64 (-9223372036854775808n)', bint('-9223372036854775808'), byte(0xd3, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
  ] : [],
  'u_bigint': hasBigInt ? [
    type('min (4294967296)', bint('4294967296'), byte(0xcf, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00)),
    type('s_uint64 overflow (9007199254740993n)', bint('9007199254740993'), byte(0xcf, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01)),
    type('max (18446744073709551615n)', bint('18446744073709551615'), byte(0xcf, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)),
  ] : [],
  'i_bigint': hasBigInt ? [
    type('min (-2147483649n)', bint('-2147483649'), byte(0xd3, 0xff, 0xff, 0xff, 0xff, 0x7f, 0xff, 0xff, 0xff)),
    type('s_int64 overflow (-9007199254740993n)', bint('-9007199254740993'), byte(0xd3, 0xff, 0xdf, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)),
    type('max int64 (-9223372036854775808n)', bint('-9223372036854775808'), byte(0xd3, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00)),
  ] : [],

  'fixstr': [
    type('min (0)', '', byte(0xa0)),
    type('max (31)', strN('a', 31), byte(0xbf, ...byteN(0x61, 31))),
  ],
  'str8': [
    type('min (32)', strN('a', 32), byte(0xd9, 0x20, ...byteN(0x61, 32))),
    type('max (255)', strN('a', 255), byte(0xd9, 0xff, ...byteN(0x61, 255))),
  ],
  'str16': [
    type('min (256)', strN('a', 256), byte(0xda, 0x01, 0x00, ...byteN(0x61, 256))),
    type('max (65535)', strN('a', 65535), byte(0xda, 0xff, 0xff, ...byteN(0x61, 65535))),
  ],
  'str32': [
    type('max (65536)', strN('a', 65536), byte(0xdb, 0x00, 0x01, 0x00, 0x00, ...byteN(0x61, 65536))),
  ],

  'utf8': [
    type('1 byte (u0000)', '\u0000', byte(0xa1, 0x00)),
    type('1 byte (u007f)', '\u007f', byte(0xa1, 0x7f)),
    type('2 byte (u0080)', '\u0080', byte(0xa2, 0xc2, 0x80)),
    type('2 byte (u07ff)', '\u07ff', byte(0xa2, 0xdf, 0xbf)),
    type('3 byte (u0800)', '\u0800', byte(0xa3, 0xe0, 0xa0, 0x80)),
    type('3 byte (uffff)', '\uffff', byte(0xa3, 0xef, 0xbf, 0xbf)),
    type('4 byte (u10000)', '\u10000', byte(0xa4, 0xe1, 0x80, 0x80, 0x30)),
    type('4 byte (u10ffff)', '\u10ffff', byte(0xa5, 0xe1, 0x83,0xbf, 0x66, 0x66)),
  ],

  'bin8': [
    type('min (0)', byte(), byte(0xc4, 0x00)),
    type('opt (6)', byteN(1, 6), byte(0xc4, 0x06, ...byteN(1, 6))),
    type('max (255)', byteN(1, 255), byte(0xc4, 0xff, ...byteN(1, 255))),
  ],
  'bin16': [
    type('min (256)', byteN(1, 256), byte(0xc5, 0x01, 0x00, ...byteN(1, 256))),
    type('max (65535)', byteN(1, 65535), byte(0xc5, 0xff, 0xff, ...byteN(1, 65535))),
  ],
  'bin32': [
    type('min (65536)', byteN(1, 65536), byte(0xc6, 0x00, 0x01, 0x00, 0x00, ...byteN(1, 65536))),
  ],

  'fixarr': [
    type('min (0)', [], byte(0x90)),
    type('min (15)', arrN(1, 15), byte(0x9f, ...byteN(0x01, 15))),
  ],
  'arr16': [
    type('min (16)', arrN(1, 16), byte(0xdc, 0x00, 0x10, ...byteN(0x01, 16))),
    type('min (65535)', arrN(1, 65535), byte(0xdc, 0xff, 0xff, ...byteN(0x01, 65535))),
  ],
  'arr32': [
    type('min (65536)', arrN(1, 65536), byte(0xdd, 0x00, 0x01, 0x00, 0x00, ...byteN(0x01, 65536))),
  ],

  'fixobj': [
    type('min (0)', {}, byte(0x80)),
    type('max (15)', objN(1, 15), byte(0x8f, ...byteStrN('\x01', 15))),
  ],
  'obj16': [
    type('min (16)', objN(1, 16), Buffer.from([0xde, 0x00, 0x10, ...byteStrN('\x01', 16)])),
    type('max (65535)', objN(1, 65535), Buffer.from([0xde, 0xff, 0xff, ...byteStrN('\x01', 65535)])),
  ],
  'obj32': [
    type('min (65536)', objN(1, 65536), Buffer.from([0xdf, 0x00, 0x01, 0x00, 0x00, ...byteStrN('\x01', 65536)])),
  ],

  'fixmap': [
    type('min (0)', new Map(), byte(0x80)),
    type('max (15)', mapN(1, 15), Buffer.from([0x8f, ...byteStrN('\x01', 15)])),
  ],
  'map16': [
    type('min (16)', mapN(1, 16), byte(0xde, 0x00, 0x10, ...byteStrN('\x01', 16))),
    type('min (65535)', mapN(1, 65535), Buffer.from([0xde, 0xff, 0xff, ...byteStrN('\x01', 65535)])),
  ],
  'map32': [
    type('min (65536)', mapN(1, 65536), Buffer.from([0xdf, 0x00, 0x01, 0x00, 0x00, ...byteStrN('\x01', 65536)])),
  ],

  'fixext': [
    type('1', ext(1, '\xc0'), byte(0xd4, 0x01, 0xc0)),
    type('2', ext(1, strN('\xc0', 2)), byte(0xd5, 0x01, ...byteN(0xc0, 2))),
    type('4', ext(1, strN('\xc0', 4)), byte(0xd6, 0x01, ...byteN(0xc0, 4))),
    type('8', ext(1, strN('\xc0', 8)), byte(0xd7, 0x01, ...byteN(0xc0, 8))),
    type('16', ext(1, strN('\xc0', 16)), byte(0xd8, 0x01, ...byteN(0xc0, 16))),
  ],
  'ext8': [
    type('min (17)', ext(1, strN('\xc0', 17)), byte(0xc7, 0x11, 0x01, ...byteN(0xc0, 17))),
    type('max (255)', ext(1, strN('\xc0', 255)), byte(0xc7, 0xff, 0x01, ...byteN(0xc0, 255))),
  ],
  'ext16': [
    type('min (256)', ext(1, strN('\xc0', 256)), byte(0xc8, 0x01, 0x00, 0x01, ...byteN(0xc0, 256))),
    type('max (65535)', ext(1, strN('\xc0', 65535)), byte(0xc8, 0xff, 0xff, 0x01, ...byteN(0xc0, 65535))),
  ],
  'ext32': [
    type('max (65536)', ext(1, strN('\xc0', 65536)), byte(0xc9, 0x00, 0x01, 0x00, 0x00, 0x01, ...byteN(0xc0, 65536))),
  ],
};

module.exports = stub;

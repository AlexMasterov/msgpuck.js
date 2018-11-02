'use strict';

const { utf8toBin } = require('utf8-bin');
const { throwsEncoderHandler } = require('./handlers');
const { CHR, u64, i64 } = require('./binary');
const selectEncoderFloat = require('./selectEncoderFloat');
const Ext = require('./Ext');

const isArray = Array.isArray;
const alloc = Buffer.allocUnsafe;
const isBuffer = Buffer.isBuffer;
const ObjectKeys = Object.keys;
const u8u64 = new Uint8Array(u64.buffer);
const i8i64 = new Int8Array(i64.buffer);

const Bool = 'boolean';
const Num = 'number';
const BigNum = 'bigint';
const Str = 'string';
const Symb = 'symbol';
const Obj = 'object';
const Undef = 'undefined';

const ALLOC_BYTES = 2048;

class Encoder {
  constructor({
    float='64',
    bufferMinLen=15,
    handler=throwsEncoderHandler,
    codecs=false,
  } = {}) {
    this.handler = null; // avoid function tracking on the hidden class
    this.handler = handler.bind(this);
    this.encodeFloat = selectEncoderFloat(float);
    this.codecs = codecs;
    this.alloc = 0;
    this.buffer = null;
    this.bufferMinLen = bufferMinLen >>> 0;
  }

  encode(value) {
    switch (typeof value) {
      case Str:
        return this.encodeStr(value);
      case Num:
        return (value % 1 === 0) ? this.encodeInt(value) : this.encodeFloat(value);
      case Bool:
        return value ? '\xc3' : '\xc2';
      case Undef:
        value = { __isUndefined__: true };
      case Symb:
      case Obj:
        if (value === null) return '\xc0';
        if (isArray(value)) return this.encodeArray(value);
        if (isBuffer(value)) return this.encodeBin(value);
        if (value.constructor == Ext) return this.encodeExt(value.type, value.bin);
        if (this.codecs) {
          for (let codec, i = 0; i < this.codecs.length; i++) {
            codec = this.codecs[i];
            if (codec.supports(value)) {
              return this.encodeExt(codec.type, codec.encode(this, value));
            }
          }
        }
        return this.encodeObject(value);
      case BigNum:
        return (value > 0xffffffff || value < -0x80000000)
          ? this.encodeBigInt(value)
          : this.encodeInt(Number(value));

      default:
        return this.handler(value);
    }
  }

  encodeNil() {
    return '\xc0';
  }

  encodeBool(bool) {
    return bool ? '\xc3' : '\xc2';
  }

  encodeInt(num) {
    if (num < 0) {
      // negative fixint
      if (num > -0x21) {
        return CHR(num & 0xff);
      }
      // int 8
      if (num > -0x81) {
        return '\xd0'
          + CHR(num & 0xff);
      }
      // int 16
      if (num > -0x8001) {
        return '\xd1'
          + CHR(num >> 8 & 0xff)
          + CHR(num & 0xff);
      }
      // int 32
      if (num > -0x80000001) {
        return '\xd2'
          + CHR(num >> 24 & 0xff)
          + CHR(num >> 16 & 0xff)
          + CHR(num >> 8 & 0xff)
          + CHR(num & 0xff);
      }
      // s_int 64
      if (num > -0x20000000000001) {
        return '\xd3'
          + encodeInt64(
            (num / 0x100000000 >> 0) - 1,
            num >>> 0
          );
      }
      // -Infinity
      return '\xd3\xff\xdf\xff\xff\xff\xff\xff\xff';
    }
    // positive fixint
    if (num < 0x80) {
      return CHR(num);
    }
    // uint 8
    if (num < 0x100) {
      return '\xcc'
        + CHR(num);
    }
    // uint 16
    if (num < 0x10000) {
      return '\xcd'
        + CHR(num >> 8)
        + CHR(num & 0xff);
    }
    // uint 32
    if (num < 0x100000000) {
      return '\xce'
        + CHR(num >> 24 & 0xff)
        + CHR(num >> 16 & 0xff)
        + CHR(num >> 8 & 0xff)
        + CHR(num & 0xff);
    }
    // s_uint 64
    if (num < 0x20000000000000) {
      return '\xcf'
        + encodeInt64(
          num >>> 11 | 1,
          num
        );
    }
    // Infinity
    return '\xcf\x00\x20\x00\x00\x00\x00\x00\x00';
  }

  encodeBigInt(bignum) {
    if (bignum < 0) {
      i64[0] = bignum;
      return '\xd3'
        + CHR(i8i64[7] & 0xff)
        + CHR(i8i64[6] & 0xff)
        + CHR(i8i64[5] & 0xff)
        + CHR(i8i64[4] & 0xff)
        + CHR(i8i64[3] & 0xff)
        + CHR(i8i64[2] & 0xff)
        + CHR(i8i64[1] & 0xff)
        + CHR(i8i64[0] & 0xff);
    }

    u64[0] = bignum;
    return '\xcf'
      + CHR(u8u64[7])
      + CHR(u8u64[6])
      + CHR(u8u64[5])
      + CHR(u8u64[4])
      + CHR(u8u64[3])
      + CHR(u8u64[2])
      + CHR(u8u64[1])
      + CHR(u8u64[0]);
  }

  encodeStr(str) {
    let len = str.length, bin = '\xa0';
    if (len === 0) return bin;

    if (len < this.bufferMinLen) {
      bin = utf8toBin(str);
      len = bin.length;
    } else {
      if (len > this.alloc) {
        this.alloc = ALLOC_BYTES * (len >>> 10 | 2);
        this.buffer = alloc(this.alloc);
      }
      len = this.buffer.utf8Write(str, 0);
      bin = this.buffer.latin1Slice(0, len);
    }

    // fixstr
    if (len < 0x20) {
      return CHR(len | 0xa0)
        + bin;
    }
    // str 8
    if (len < 0x100) {
      return '\xd9'
        + CHR(len)
        + bin;
    }
    // str 16
    if (len < 0x10000) {
      return '\xda'
        + CHR(len >> 8)
        + CHR(len & 0xff)
        + bin;
    }
    // str 32
    return '\xdb'
      + CHR(len >> 24 & 0xff)
      + CHR(len >> 16 & 0xff)
      + CHR(len >> 8 & 0xff)
      + CHR(len & 0xff)
      + bin;
  }

  encodeBin(buf) {
    const len = buf.length;
    if (len === 0) return '\xc4\x00';

    let bin;
    if (len < 7) {
      bin = '';
      for (let i = 0; i < len; i++) {
        bin += CHR(buf[i]);
      }
    } else {
      bin = buf.latin1Slice(0, len);
    }

    // bin 8
    if (len < 0x100) {
      return '\xc4'
        + CHR(len)
        + bin;
    }
    // bin 16
    if (len < 0x10000) {
      return '\xc5'
        + CHR(len >> 8)
        + CHR(len & 0xff)
        + bin;
    }
    // bin 32
    return '\xc6'
      + CHR(len >> 24 & 0xff)
      + CHR(len >> 16 & 0xff)
      + CHR(len >> 8 & 0xff)
      + CHR(len & 0xff)
      + bin;
  }

  encodeArray(arr) {
    const len = arr.length;
    if (len === 0) return '\x90';

    let bin;
    if (len < 0x10) { // fixarray
      bin = CHR(0x90 | len);
    } else if (len < 0x10000) { // array 16
      bin = '\xdc'
        + CHR(len >> 8)
        + CHR(len & 0xff);
    } else { // array 32
      bin = '\xdd'
        + CHR(len >> 24 & 0xff)
        + CHR(len >> 16 & 0xff)
        + CHR(len >> 8 & 0xff)
        + CHR(len & 0xff);
    }

    for (let i = 0; i < len; i++) {
      bin += this.encode(arr[i]);
    }

    return bin;
  }

  encodeObject(obj) {
    const keys = ObjectKeys(obj);
    const len = keys.length;
    if (len === 0) return '\x80';

    let bin;
    if (len < 0x10) { // fixmap
      bin = CHR(0x80 | len);
    } else if (len < 0x10000) { // map 16
      bin = '\xde'
        + CHR(len >> 8)
        + CHR(len & 0xff);
    } else { // map 32
      bin = '\xdf'
        + CHR(len >> 24 & 0xff)
        + CHR(len >> 16 & 0xff)
        + CHR(len >> 8 & 0xff)
        + CHR(len & 0xff);
    }

    for (let key, i = 0; i < len; i++) {
      key = keys[i];
      bin += this.encodeStr(key);
      bin += this.encode(obj[key]);
    }

    return bin;
  }

  encodeMap(map) {
    const size = map.size;
    if (size === 0) return '\x80';

    let bin;
    if (size < 0x10) { // fixmap
      bin = CHR(0x80 | size);
    } else if (size < 0x10000) { // map 16
      bin = '\xde'
        + CHR(size >> 8)
        + CHR(size & 0xff);
    } else { // map 32
      bin = '\xdf'
        + CHR(size >> 24 & 0xff)
        + CHR(size >> 16 & 0xff)
        + CHR(size >> 8 & 0xff)
        + CHR(size & 0xff);
    }

    for (const [key, value] of map) {
      bin += this.encode(key);
      bin += this.encode(value);
    }

    return bin;
  }

  encodeExt(type, bin) {
    const ext = CHR(type & 0x7f) + bin;
    const len = bin.length;

    // fixext 1/2/4/8/16
    switch (len) {
      case 1: return '\xd4' + ext;
      case 2: return '\xd5' + ext;
      case 4: return '\xd6' + ext;
      case 8: return '\xd7' + ext;
      case 16: return '\xd8' + ext;
    }
    // ext 8
    if (len < 0x100) {
      return '\xc7'
        + CHR(len)
        + ext;
    }
    // ext 16
    if (len < 0x10000) {
      return '\xc8'
        + CHR(len >> 8)
        + CHR(len & 0xff)
        + ext;
    }
    // ext 32
    return '\xc9'
      + CHR(len >> 24 & 0xff)
      + CHR(len >> 16 & 0xff)
      + CHR(len >> 8 & 0xff)
      + CHR(len & 0xff)
      + ext;
  }
}

function encodeInt64(hi, lo) {
  return CHR(hi >> 24 & 0xff)
    + CHR(hi >> 16 & 0xff)
    + CHR(hi >> 8 & 0xff)
    + CHR(hi & 0xff)
    + CHR(lo >> 24 & 0xff)
    + CHR(lo >> 16 & 0xff)
    + CHR(lo >> 8 & 0xff)
    + CHR(lo & 0xff);
}

module.exports = Encoder;

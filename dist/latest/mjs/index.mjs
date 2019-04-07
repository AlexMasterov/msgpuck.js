import { a as charCode, b as codePoint, c as charCodes2, d as f32, e as f64, f as u64, g as i64, h as selectEncoderFloat, i as encodeAscii, j as encodeInt64 } from './encoders/index-ef1c553f.mjs';
import './errors/index.mjs';
import { throwsDecoderHandler, throwsEncoderHandler } from './handlers/index.mjs';

const binToUtf8 = (bin, offset, length) => {
  let str = '', c;
  while (offset < length) {
    c = bin[offset];

    if (c < 0x80) { // 1 byte
      str += charCode(c);
      offset += 1;
    } else if (c < 0xe0) { // 2 bytes
      str += charCode(
        (c & 0x1f) << 6
        | bin[offset + 1] & 0x3f);
      offset += 2;
    } else { // 3-4 bytes
      str += codePoint(
        (c & 0x0f) << 12
        | (bin[offset + 1] & 0x3f) << 6
        | bin[offset + 2] & 0x3f);
      offset += 3;
    }
  }

  return str;
};

const CHAR_CONTROL = '\u0080';
const CHAR_SAMARITAN = '\u0800';

const utf8toBin = (str) => {
  let bin = '';
  for (let c, i = 0; i < str.length; i++) {
    c = str[i];

    if (c < CHAR_CONTROL) { // 1 byte
      bin += c;
    } else if (c < CHAR_SAMARITAN) { // 2 bytes
      bin += charCodes2[c.charCodeAt(0)];
    } else { // 3-4 bytes
      c = c.codePointAt(0);
      bin += charCode(
        0xe0 | c >> 12 & 0x0f,
        0x80 | c >> 6 & 0x3f,
        0x80 | c & 0x3f);
    }
  }

  return bin;
};

function required(name) {
  throw new Error(`Missing parameter: ${name}`);
}

class Ext {
  constructor(
    type=required('type'),
    bin=required('bin')
  ) {
    this.type = type;
    this.bin = bin;
  }
}

const FastBuffer = Buffer[Symbol.species];
const u32f32 = new Uint32Array(f32.buffer);
const u32f64 = new Uint32Array(f64.buffer);
const u32u64 = new Uint32Array(u64.buffer);
const i32i64 = new Int32Array(i64.buffer);

const packCodecs = (codecs) => {
  const pack = new Map();

  let codec, i = codecs.length;
  while (i > 0) {
    codec = codecs[i -= 1];
    pack.set(codec.type, codec);
  }

  return pack;
};

class Decoder {
  constructor({
    handler=throwsDecoderHandler,
    codecs=false,
    bufferLenMin=15,
  } = {}) {
    this.unexpectedLength = handler.bind(this);
    this.codecs = codecs && packCodecs(codecs);
    this.buffer = null;
    this.bufferLenMin = bufferLenMin >>> 0;
    this.offset = 0;
    this.length = 0;
  }

  decode(buffer, start=0, end=buffer.length) {
    this.buffer = buffer;
    this.offset = start;
    this.length = start + end;

    return this.parse();
  }

  parse() {
    if (this.length <= this.offset) {
      return this.unexpectedLength(1);
    }

    const byte = this.buffer[this.offset];
    this.offset += 1;

    if (byte < 0xc0) {
      // positive fixint
      if (byte < 0x80) {
        return byte;
      }
      // fixmap
      if (byte < 0x90) {
        return (byte === 0x80) ? {} : this.decodeMap(byte & 0xf);
      }
      // fixarray
      if (byte < 0xa0) {
        return (byte === 0x90) ? [] : this.decodeArray(byte & 0x0f);
      }
      // fixstr
      return (byte === 0xa0) ? '' : this.decodeStr(byte & 0x1f);
    }
    // negative fixint
    if (byte > 0xdf) {
      return byte - 0x100;
    }

    switch (byte) {
      case 0xc0: return null;
      case 0xc2: return false;
      case 0xc3: return true;

      // float 32/64
      case 0xca: return this.decodeFloat32();
      case 0xcb: return this.decodeFloat64();

      // uint 8/16/32/64
      case 0xcc: return this.decodeUint8();
      case 0xcd: return this.decodeUint16();
      case 0xce: return this.decodeUint32();
      case 0xcf: return this.decodeUint64();

      // int 8/16/32/64
      case 0xd0: return this.decodeInt8();
      case 0xd1: return this.decodeInt16();
      case 0xd2: return this.decodeInt32();
      case 0xd3: return this.decodeInt64();

      // str 8/16/32
      case 0xd9: return this.decodeStr(this.decodeUint8());
      case 0xda: return this.decodeStr(this.decodeUint16());
      case 0xdb: return this.decodeStr(this.decodeUint32());

      // array 16/32
      case 0xdc: return this.decodeArray(this.decodeUint16());
      case 0xdd: return this.decodeArray(this.decodeUint32());

      // map 16/32
      case 0xde: return this.decodeMap(this.decodeUint16());
      case 0xdf: return this.decodeMap(this.decodeUint32());

      // bin 8/16/32
      case 0xc4: return this.decodeBin(this.decodeUint8());
      case 0xc5: return this.decodeBin(this.decodeUint16());
      case 0xc6: return this.decodeBin(this.decodeUint32());

      // fixext 1/2/4/8/16
      case 0xd4: return this.decodeExt(1);
      case 0xd5: return this.decodeExt(2);
      case 0xd6: return this.decodeExt(4);
      case 0xd7: return this.decodeExt(8);
      case 0xd8: return this.decodeExt(16);

      // ext 8/16/32
      case 0xc7: return this.decodeExt(this.decodeUint8());
      case 0xc8: return this.decodeExt(this.decodeUint16());
      case 0xc9: return this.decodeExt(this.decodeUint32());

      default: return this.unexpectedLength(0);
    }
  }

  decodeFloat32() {
    if (this.length < this.offset + 4) {
      return this.unexpectedLength(4);
    }

    u32f32[0] = this.buffer[this.offset] * 0x1000000
      | this.buffer[this.offset + 1] << 16
      | this.buffer[this.offset + 2] << 8
      | this.buffer[this.offset + 3];

    this.offset += 4;

    return f32[0];
  }

  decodeFloat64() {
    if (this.length < this.offset + 8) {
      return this.unexpectedLength(8);
    }

    u32f64[1] = this.buffer[this.offset] * 0x1000000
      | this.buffer[this.offset + 1] << 16
      | this.buffer[this.offset + 2] << 8
      | this.buffer[this.offset + 3];

    u32f64[0] = this.buffer[this.offset + 4] * 0x1000000
      | this.buffer[this.offset + 5] << 16
      | this.buffer[this.offset + 6] << 8
      | this.buffer[this.offset + 7];

    this.offset += 8;

    return f64[0];
  }

  decodeUint8() {
    if (this.length <= this.offset) {
      return this.unexpectedLength(1);
    }

    const num = this.buffer[this.offset];

    this.offset += 1;

    return num;
  }

  decodeUint16() {
    if (this.length < this.offset + 2) {
      return this.unexpectedLength(2);
    }

    const num = this.buffer[this.offset] << 8
      | this.buffer[this.offset + 1];

    this.offset += 2;

    return num;
  }

  decodeUint32() {
    if (this.length < this.offset + 4) {
      return this.unexpectedLength(4);
    }

    const num = this.buffer[this.offset] * 0x1000000
      + (this.buffer[this.offset + 1] << 16
        | this.buffer[this.offset + 2] << 8
        | this.buffer[this.offset + 3]);

    this.offset += 4;

    return num;
  }

  decodeUint64() {
    if (this.length < this.offset + 8) {
      return this.unexpectedLength(8);
    }

    u32u64[1] = this.buffer[this.offset] << 24
      | this.buffer[this.offset + 1] << 16
      | this.buffer[this.offset + 2] << 8
      | this.buffer[this.offset + 3];

    u32u64[0] = this.buffer[this.offset + 4] << 24
      | this.buffer[this.offset + 5] << 16
      | this.buffer[this.offset + 6] << 8
      | this.buffer[this.offset + 7];

    this.offset += 8;

    return u64[0];
  }

  decodeInt8() {
    if (this.length <= this.offset) {
      return this.unexpectedLength(1);
    }

    const num = this.buffer[this.offset] - 0x100;

    this.offset += 1;

    return num;
  }

  decodeInt16() {
    if (this.length < this.offset + 2) {
      return this.unexpectedLength(2);
    }

    const num = (this.buffer[this.offset] << 8
      | this.buffer[this.offset + 1]) - 0x10000;

    this.offset += 2;

    return num;
  }

  decodeInt32() {
    if (this.length < this.offset + 4) {
      return this.unexpectedLength(4);
    }

    const num = this.buffer[this.offset] << 24
      | this.buffer[this.offset + 1] << 16
      | this.buffer[this.offset + 2] << 8
      | this.buffer[this.offset + 3];

    this.offset += 4;

    return num;
  }

  decodeInt64() {
    if (this.length < this.offset + 8) {
      return this.unexpectedLength(8);
    }

    i32i64[1] = this.buffer[this.offset] << 24
      | this.buffer[this.offset + 1] << 16
      | this.buffer[this.offset + 2] << 8
      | this.buffer[this.offset + 3];

    i32i64[0] = this.buffer[this.offset + 4] << 24
      | this.buffer[this.offset + 5] << 16
      | this.buffer[this.offset + 6] << 8
      | this.buffer[this.offset + 7];

    this.offset += 8;

    return i64[0];
  }

  decodeBin(length) {
    if (this.length < this.offset + length) {
      return this.unexpectedLength(length);
    }

    const start = this.buffer.byteOffset + this.offset;
    this.offset += length;

    return new FastBuffer(this.buffer.buffer, start, length);
  }

  decodeStr(length) {
    if (this.length < this.offset + length) {
      return this.unexpectedLength(length);
    }

    return (length < this.bufferLenMin)
      ? binToUtf8(this.buffer, this.offset, this.offset += length)
      : this.buffer.utf8Slice(this.offset, this.offset += length);
  }

  decodeArray(size) {
    const array = new Array(size);
    for (let i = 0; i < size; i++) {
      array[i] = this.parse();
    }

    return array;
  }

  decodeMap(size) {
    const map = {};
    while (size > 0) {
      size -= 1;
      map[this.parse()] = this.parse();
    }

    return map;
  }

  decodeExt(length) {
    if (this.length < this.offset + length) {
      return this.unexpectedLength(length);
    }

    const type = this.buffer[this.offset];
    this.offset += 1;

    if (this.codecs) {
      const codec = this.codecs.get(type);
      if (codec !== void 0) {
        return codec.decode(this, length);
      }
    }

    return new Ext(
      type,
      this.buffer.latin1Slice(this.offset, this.offset += length)
    );
  }
}

const isBuffer = Buffer.isBuffer;
const alloc = Buffer.allocUnsafe;
const u8u64 = new Uint8Array(u64.buffer);
const i8i64 = new Int8Array(i64.buffer);

const Bool = 'boolean';
const Num = 'number';
const Obj = 'object';
const Str = 'string';
const BigNum = 'bigint';

class Encoder {
  constructor({
    handler=throwsEncoderHandler,
    codecs=false,
    float='64',
    objectKey='ascii',
    objectCase=Object.keys,
    arrayCase=Array.isArray,
    bufferLenMin=15,
    bufferAllocMin=2048,
  } = {}) {
    this.unsupportedType = handler.bind(this);
    this.codecs = codecs;
    this.encodeFloat = selectEncoderFloat(float);
    this.encodeObjectKey = (objectKey === 'ascii') ? encodeAscii : this.encodeStr;
    this.objectKeys = objectCase;
    this.isArray = arrayCase;
    this.buffer = null;
    this.bufferAlloc = 0;
    this.bufferLenMin = bufferLenMin >>> 0;
    this.bufferAllocMin = bufferAllocMin >>> 0;
  }

  encode(value) {
    switch (typeof value) {
      case Str:
        return this.encodeStr(value);
      case Num:
        return (value % 1 === 0) ? this.encodeInt(value) : this.encodeFloat(value);
      case Obj:
        if (value === null) return '\xc0';
        if (this.isArray(value)) return this.encodeArray(value);
        if (isBuffer(value)) return this.encodeBin(value);
        if (value.constructor == Ext) return this.encodeExt(value.type, value.bin);
        if (this.codecs !== false) {
          let bin, i = this.codecs.length;
          while (i > 0) {
            bin = this.codecs[i -= 1].encode(this, value);
            if (bin !== null) return bin;
          }
        }
        return this.encodeObject(value);
      case Bool:
        return value ? '\xc3' : '\xc2';
      case BigNum:
        return (value > 0xffffffff || value < -0x80000000)
          ? this.encodeBigInt(value)
          : this.encodeInt(Number(value));

      default:
        return this.unsupportedType(value);
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
        return charCode(num & 0xff);
      }
      // int 8
      if (num > -0x81) {
        return '\xd0'
          + charCode(num & 0xff);
      }
      // int 16
      if (num > -0x8001) {
        return '\xd1'
          + charCode(num >> 8 & 0xff)
          + charCode(num & 0xff);
      }
      // int 32
      if (num > -0x80000001) {
        return '\xd2'
          + charCode(num >> 24 & 0xff)
          + charCode(num >> 16 & 0xff)
          + charCode(num >> 8 & 0xff)
          + charCode(num & 0xff);
      }
      // int 64 safe
      if (num > -0x20000000000001) {
        return '\xd3'
          + encodeInt64(
            (num / 0x100000000 >> 0) - 1,
            num >>> 0
          );
      }
      // -Infinity
      return '\xcb\xff\xf0\x00\x00\x00\x00\x00\x00';
    }
    // positive fixint
    if (num < 0x80) {
      return charCode(num);
    }
    // uint 8
    if (num < 0x100) {
      return '\xcc'
        + charCode(num);
    }
    // uint 16
    if (num < 0x10000) {
      return '\xcd'
        + charCode(num >> 8)
        + charCode(num & 0xff);
    }
    // uint 32
    if (num < 0x100000000) {
      return '\xce'
        + charCode(num >> 24 & 0xff)
        + charCode(num >> 16 & 0xff)
        + charCode(num >> 8 & 0xff)
        + charCode(num & 0xff);
    }
    // uint 64 safe
    if (num < 0x20000000000000) {
      return '\xcf'
        + encodeInt64(
          num >>> 11 | 1,
          num
        );
    }
    // Infinity
    return '\xcb\x7f\xf0\x00\x00\x00\x00\x00\x00';
  }

  encodeBigInt(bignum) {
    if (bignum < 0) {
      i64[0] = bignum;
      return '\xd3'
        + charCode(i8i64[7] & 0xff)
        + charCode(i8i64[6] & 0xff)
        + charCode(i8i64[5] & 0xff)
        + charCode(i8i64[4] & 0xff)
        + charCode(i8i64[3] & 0xff)
        + charCode(i8i64[2] & 0xff)
        + charCode(i8i64[1] & 0xff)
        + charCode(i8i64[0] & 0xff);
    }

    u64[0] = bignum;
    return '\xcf'
      + charCode(u8u64[7])
      + charCode(u8u64[6])
      + charCode(u8u64[5])
      + charCode(u8u64[4])
      + charCode(u8u64[3])
      + charCode(u8u64[2])
      + charCode(u8u64[1])
      + charCode(u8u64[0]);
  }

  encodeStr(str) {
    let len = str.length, bin;
    if (len === 0) return '\xa0';

    if (len < this.bufferLenMin) {
      bin = utf8toBin(str);
      len = bin.length;
    } else {
      if (len > this.bufferAlloc) {
        this.bufferAlloc = this.bufferAllocMin * (len >>> 10 | 2);
        this.buffer = alloc(this.bufferAlloc);
      }
      len = this.buffer.utf8Write(str, 0);
      bin = this.buffer.latin1Slice(0, len);
    }

    // fixstr
    if (len < 0x20) {
      return charCode(len | 0xa0)
        + bin;
    }
    // str 8
    if (len < 0x100) {
      return '\xd9'
        + charCode(len)
        + bin;
    }
    // str 16
    if (len < 0x10000) {
      return '\xda'
        + charCode(len >> 8)
        + charCode(len & 0xff)
        + bin;
    }
    // str 32
    return '\xdb'
      + charCode(len >> 24 & 0xff)
      + charCode(len >> 16 & 0xff)
      + charCode(len >> 8 & 0xff)
      + charCode(len & 0xff)
      + bin;
  }

  encodeBin(buf) {
    const len = buf.length;
    if (len === 0) return '\xc4\x00';

    let bin;
    if (len < 7) {
      bin = '';
      for (let i = 0; i < len; i++) {
        bin += charCode(buf[i]);
      }
    } else {
      bin = buf.latin1Slice(0, len);
    }

    // bin 8
    if (len < 0x100) {
      return '\xc4'
        + charCode(len)
        + bin;
    }
    // bin 16
    if (len < 0x10000) {
      return '\xc5'
        + charCode(len >> 8)
        + charCode(len & 0xff)
        + bin;
    }
    // bin 32
    return '\xc6'
      + charCode(len >> 24 & 0xff)
      + charCode(len >> 16 & 0xff)
      + charCode(len >> 8 & 0xff)
      + charCode(len & 0xff)
      + bin;
  }

  encodeArray(arr) {
    const len = arr.length;
    if (len === 0) return '\x90';

    let bin;
    if (len < 0x10) { // fixarray
      bin = charCode(0x90 | len);
    } else if (len < 0x10000) { // array 16
      bin = '\xdc'
        + charCode(len >> 8)
        + charCode(len & 0xff);
    } else { // array 32
      bin = '\xdd'
        + charCode(len >> 24 & 0xff)
        + charCode(len >> 16 & 0xff)
        + charCode(len >> 8 & 0xff)
        + charCode(len & 0xff);
    }

    for (let i = 0; i < len; i++) {
      bin += this.encode(arr[i]);
    }

    return bin;
  }

  encodeObject(obj) {
    const keys = this.objectKeys(obj);
    const len = keys.length;
    if (len === 0) return '\x80';

    let bin;
    if (len < 0x10) { // fixmap
      bin = charCode(0x80 | len);
    } else if (len < 0x10000) { // map 16
      bin = '\xde'
        + charCode(len >> 8)
        + charCode(len & 0xff);
    } else { // map 32
      bin = '\xdf'
        + charCode(len >> 24 & 0xff)
        + charCode(len >> 16 & 0xff)
        + charCode(len >> 8 & 0xff)
        + charCode(len & 0xff);
    }

    for (let key, i = 0; i < len; i++) {
      key = keys[i];
      bin += this.encodeObjectKey(key);
      bin += this.encode(obj[key]);
    }

    return bin;
  }

  encodeExt(type, bin) {
    const ext = charCode(type & 0x7f) + bin;
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
        + charCode(len)
        + ext;
    }
    // ext 16
    if (len < 0x10000) {
      return '\xc8'
        + charCode(len >> 8)
        + charCode(len & 0xff)
        + ext;
    }
    // ext 32
    return '\xc9'
      + charCode(len >> 24 & 0xff)
      + charCode(len >> 16 & 0xff)
      + charCode(len >> 8 & 0xff)
      + charCode(len & 0xff)
      + ext;
  }
}

export { Decoder, Encoder, Ext };

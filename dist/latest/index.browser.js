const charCode = String.fromCharCode;
const codePoint = String.fromCodePoint;

function utf8To11Bits() {
  let i = 2048, chr = new Array(i);
  chr[i] = '\x00';
  // 2 bytes
  while (i > 0x80) {
    chr[i -= 1] = charCode(
      0xc0 | i >> 6 & 0x1f,
      0x80 | i & 0x3f);
  }
  // 1 byte
  while (i > 0) {
    chr[i -= 1] = charCode(i);
  }

  return chr;
}

var CHR2 = utf8To11Bits();

const CHAR_CONTROL = '\u0080';
const CHAR_SAMARITAN = '\u0800';

function utf8toBin(str) {
  let bin = '';
  for (let c, i = 0; i < str.length; i++) {
    c = str[i];

    if (c < CHAR_CONTROL) { // 1 byte
      bin += c;
    } else if (c < CHAR_SAMARITAN) { // 2 bytes
      bin += CHR2[c.charCodeAt(0)];
    } else { // 3-4 bytes
      c = c.codePointAt(0);
      bin += charCode(
        0xe0 | c >> 12 & 0x0f,
        0x80 | c >> 6 & 0x3f,
        0x80 | c & 0x3f);
    }
  }

  return bin;
}

function binToUtf8(bin, offset, length) {
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
}

class MsgPackError extends Error {
  constructor(message) {
    super(message);

    Error.captureStackTrace(this, new.target);

    this.name = new.target.name;
    this.message = message;
  }
}

class DecodingFailed extends MsgPackError {
  static fromOffset(offset) {
    return new this(`Cannot decode data with byte-header in position ${offset}`);
  }
}

class EncodingFailed extends MsgPackError {
  static withValue(value) {
    return new this(`Could not encode: ${typeof value}`);
  }
}

class InsufficientData extends DecodingFailed {
  static unexpectedLength(expected, actual) {
    return new this(`Not enough data to decode: expected length ${expected}, got ${actual}`);
  }
}

function throwsDecoderHandler(expectedLength) {
  if (expectedLength === 0) {
    throw DecodingFailed.fromOffset(this.offset);
  }

  throw InsufficientData.unexpectedLength(expectedLength, this.length - this.offset);
}

function throwsEncoderHandler(value) {
  throw EncodingFailed.withValue(value);
}

const CHR = String.fromCharCode;

const u8 = new Uint8Array(8);
const f32 = new Float32Array(1);
const f64 = new Float64Array(1);
const u64 = new BigUint64Array(1);
const i64 = new BigInt64Array(1);

function encodeAscii(str) {
  const len = str.length;
  // fixstr
  if (len < 0x20) {
    return CHR(len | 0xa0)
      + str;
  }
  // str 8
  if (len < 0x100) {
    return '\xd9'
      + CHR(len)
      + str;
  }
  // str 16
  if (len < 0x10000) {
    return '\xda'
      + CHR(len >> 8)
      + CHR(len & 0xff)
      + str;
  }
  // str 32
  return '\xdb'
    + CHR(len >> 24 & 0xff)
    + CHR(len >> 16 & 0xff)
    + CHR(len >> 8 & 0xff)
    + CHR(len & 0xff)
    + str;
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

const fround = Math.fround;
const u8f32 = new Uint8Array(f32.buffer);
const vu8 = new DataView(u8.buffer);

function encodeFloat(num) {
  if (num === fround(num)) {
    f32[0] = num;
    return '\xca'
      + CHR(u8f32[3])
      + CHR(u8f32[2])
      + CHR(u8f32[1])
      + CHR(u8f32[0]);
  }

  vu8.setFloat64(0, num);
  return '\xcb'
    + CHR(u8[0])
    + CHR(u8[1])
    + CHR(u8[2])
    + CHR(u8[3])
    + CHR(u8[4])
    + CHR(u8[5])
    + CHR(u8[6])
    + CHR(u8[7]);
}

function encodeFloat32(num) {
  f32[0] = num;
  return '\xca'
    + CHR(u8f32[3])
    + CHR(u8f32[2])
    + CHR(u8f32[1])
    + CHR(u8f32[0]);
}

function encodeFloat64(num) {
  vu8.setFloat64(0, num);
  return '\xcb'
    + CHR(u8[0])
    + CHR(u8[1])
    + CHR(u8[2])
    + CHR(u8[3])
    + CHR(u8[4])
    + CHR(u8[5])
    + CHR(u8[6])
    + CHR(u8[7]);
}

function selectEncoderFloat(type) {
  if (type === '64') return encodeFloat64;
  if (type === '32') return encodeFloat32;
  return encodeFloat;
}

function Ext(type, bin) {
  this.type = type;
  this.bin = bin;
}

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
  } = {}) {
    this.b = handler.bind(this);
    this.a = codecs;
    this.encodeFloat = selectEncoderFloat(float);
    this.c = (objectKey === 'ascii') ? encodeAscii : this.encodeStr;
    this.d = objectCase;
    this.e = arrayCase;
  }

  encode(value) {
    switch (typeof value) {
      case Str:
        return this.encodeStr(value);
      case Num:
        return (value % 1 === 0) ? this.encodeInt(value) : this.encodeFloat(value);
      case Obj:
        if (value === null) return '\xc0';
        if (this.e(value)) return this.encodeArray(value);
        if (isBuffer(value)) return this.encodeBin(value);
        if (value.constructor == Ext) return this.encodeExt(value.type, value.bin);
        if (this.a) {
          let bin, i = this.a.length;
          while (i > 0) {
            bin = this.a[i -= 1].encode(this, value);
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
        return this.b(value);
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
    let len = str.length;
    if (len === 0) return '\xa0';

    const bin = utf8toBin(str);
    len = bin.length;
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

    let bin = '';
    for (let i = 0; i < len; i++) {
      bin += CHR(buf[i]);
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
    const keys = this.d(obj);
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
      bin += this.c(key);
      bin += this.encode(obj[key]);
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

const u32f32 = new Uint32Array(f32.buffer);
const u32f64 = new Uint32Array(f64.buffer);
const u32u64 = new Uint32Array(u64.buffer);
const i32i64 = new Int32Array(i64.buffer);

class Decoder {
  constructor({
    handler=throwsDecoderHandler,
    codecs=false,
  } = {}) {
    this.a = handler.bind(this);
    this.b = codecs && packCodecs(codecs);
    this.c = null;
    this.d = 0;
    this.e = 0;
  }

  decode(buffer, start=0, end=buffer.length) {
    this.c = buffer;
    this.d = start;
    this.e = start + end;

    return this.f();
  }

  f() {
    if (this.e <= this.d) {
      return this.a(1);
    }

    const byte = this.c[this.d];
    this.d += 1;

    if (byte < 0xc0) {
      // positive fixint
      if (byte < 0x80) {
        return byte;
      }
      // fixmap
      if (byte < 0x90) {
        return (byte === 0x80) ? {} : this.r(byte & 0xf);
      }
      // fixarray
      if (byte < 0xa0) {
        return (byte === 0x90) ? [] : this.q(byte & 0x0f);
      }
      // fixstr
      return (byte === 0xa0) ? '' : this.s(byte & 0x1f);
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
      case 0xca: return this.g();
      case 0xcb: return this.h();

      // uint 8/16/32/64
      case 0xcc: return this.m();
      case 0xcd: return this.n();
      case 0xce: return this.o();
      case 0xcf: return this.p();

      // int 8/16/32/64
      case 0xd0: return this.i();
      case 0xd1: return this.j();
      case 0xd2: return this.k();
      case 0xd3: return this.l();

      // str 8/16/32
      case 0xd9: return this.s(this.m());
      case 0xda: return this.s(this.n());
      case 0xdb: return this.s(this.o());

      // array 16/32
      case 0xdc: return this.q(this.n());
      case 0xdd: return this.q(this.o());

      // map 16/32
      case 0xde: return this.r(this.n());
      case 0xdf: return this.r(this.o());

      // bin 8/16/32
      case 0xc4: return this.t(this.m());
      case 0xc5: return this.t(this.n());
      case 0xc6: return this.t(this.o());

      // fixext 1/2/4/8/16
      case 0xd4: return this.u(1);
      case 0xd5: return this.u(2);
      case 0xd6: return this.u(4);
      case 0xd7: return this.u(8);
      case 0xd8: return this.u(16);

      // ext 8/16/32
      case 0xc7: return this.u(this.m());
      case 0xc8: return this.u(this.n());
      case 0xc9: return this.u(this.o());

      default: return this.a(0);
    }
  }

  g() {
    if (this.e < this.d + 4) {
      return this.a(4);
    }

    u32f32[0] = this.c[this.d] * 0x1000000
      | this.c[this.d + 1] << 16
      | this.c[this.d + 2] << 8
      | this.c[this.d + 3];

    this.d += 4;

    return f32[0];
  }

  h() {
    if (this.e < this.d + 8) {
      return this.a(8);
    }

    u32f64[1] = this.c[this.d] * 0x1000000
      | this.c[this.d + 1] << 16
      | this.c[this.d + 2] << 8
      | this.c[this.d + 3];

    u32f64[0] = this.c[this.d + 4] * 0x1000000
      | this.c[this.d + 5] << 16
      | this.c[this.d + 6] << 8
      | this.c[this.d + 7];

    this.d += 8;

    return f64[0];
  }

  m() {
    if (this.e <= this.d) {
      return this.a(1);
    }

    const num = this.c[this.d];

    this.d += 1;

    return num;
  }

  n() {
    if (this.e < this.d + 2) {
      return this.a(2);
    }

    const num = this.c[this.d] << 8
      | this.c[this.d + 1];

    this.d += 2;

    return num;
  }

  o() {
    if (this.e < this.d + 4) {
      return this.a(4);
    }

    const num = this.c[this.d] * 0x1000000
      + (this.c[this.d + 1] << 16
        | this.c[this.d + 2] << 8
        | this.c[this.d + 3]);

    this.d += 4;

    return num;
  }

  p() {
    if (this.e < this.d + 8) {
      return this.a(8);
    }

    u32u64[1] = this.c[this.d] << 24
      | this.c[this.d + 1] << 16
      | this.c[this.d + 2] << 8
      | this.c[this.d + 3];

    u32u64[0] = this.c[this.d + 4] << 24
      | this.c[this.d + 5] << 16
      | this.c[this.d + 6] << 8
      | this.c[this.d + 7];

    this.d += 8;

    return u64[0];
  }

  i() {
    if (this.e <= this.d) {
      return this.a(1);
    }

    const num = this.c[this.d] - 0x100;

    this.d += 1;

    return num;
  }

  j() {
    if (this.e < this.d + 2) {
      return this.a(2);
    }

    const num = (this.c[this.d] << 8
      | this.c[this.d + 1]) - 0x10000;

    this.d += 2;

    return num;
  }

  k() {
    if (this.e < this.d + 4) {
      return this.a(4);
    }

    const num = this.c[this.d] << 24
      | this.c[this.d + 1] << 16
      | this.c[this.d + 2] << 8
      | this.c[this.d + 3];

    this.d += 4;

    return num;
  }

  l() {
    if (this.e < this.d + 8) {
      return this.a(8);
    }

    i32i64[1] = this.c[this.d] << 24
      | this.c[this.d + 1] << 16
      | this.c[this.d + 2] << 8
      | this.c[this.d + 3];

    i32i64[0] = this.c[this.d + 4] << 24
      | this.c[this.d + 5] << 16
      | this.c[this.d + 6] << 8
      | this.c[this.d + 7];

    this.d += 8;

    return i64[0];
  }

  t(length) {
    if (this.e < this.d + length) {
      return this.a(length);
    }

    const start = this.c.byteOffset + this.d;
    this.d += length;

    return new FastBuffer(this.c.buffer, start, length);
  }

  s(length) {
    if (this.e < this.d + length) {
      return this.a(length);
    }

    return binToUtf8(this.c, this.d, this.d += length);
  }

  q(size) {
    const array = new Array(size);
    for (let i = 0; i < size; i++) {
      array[i] = this.f();
    }

    return array;
  }

  r(size) {
    const map = {};
    while (size > 0) {
      size -= 1;
      map[this.f()] = this.f();
    }

    return map;
  }

  u(length) {
    if (this.e < this.d + length) {
      return this.a(length);
    }

    const type = this.c[this.d];
    this.d += 1;

    if (this.b) {
      const codec = this.b.get(type);
      if (codec !== void 0) {
        return codec.decode(this, length);
      }
    }

    return new Ext(
      type,
      this.c.slice(this.d, this.d += length)
    );
  }
}

function packCodecs(codecs) {
  const pack = new Map();

  let codec, i = codecs.length;
  while (i > 0) {
    codec = codecs[i -= 1];
    pack.set(codec.type, codec);
  }

  return pack;
}

export { Decoder, Encoder };

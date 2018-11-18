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

function asciiToStr() {
  let i = 257, chr = new Array(i), charCode = String.fromCharCode;
  while (i > 0) {
    chr[i -= 1] = charCode(i & 0xff);
  }

  return chr;
}

var asciiToStr$1 = asciiToStr();

const f32 = new Float32Array(1);
const f64 = new Float64Array(1);

function encodeAscii(str) {
  const len = str.length;
  // fixstr
  if (len < 0x20) {
    return asciiToStr$1[len | 0xa0]
      + str;
  }
  // str 8
  if (len < 0x100) {
    return '\xd9'
      + asciiToStr$1[len]
      + str;
  }
  // str 16
  if (len < 0x10000) {
    return '\xda'
      + asciiToStr$1[len >> 8]
      + asciiToStr$1[len & 0xff]
      + str;
  }
  // str 32
  return '\xdb'
    + asciiToStr$1[len >> 24 & 0xff]
    + asciiToStr$1[len >> 16 & 0xff]
    + asciiToStr$1[len >> 8 & 0xff]
    + asciiToStr$1[len & 0xff]
    + str;
}

function encodeInt64(hi, lo) {
  return asciiToStr$1[hi >> 24 & 0xff]
    + asciiToStr$1[hi >> 16 & 0xff]
    + asciiToStr$1[hi >> 8 & 0xff]
    + asciiToStr$1[hi & 0xff]
    + asciiToStr$1[lo >> 24 & 0xff]
    + asciiToStr$1[lo >> 16 & 0xff]
    + asciiToStr$1[lo >> 8 & 0xff]
    + asciiToStr$1[lo & 0xff];
}

const fround = Math.fround;
const u8f32 = new Uint8Array(f32.buffer);
const u8f64 = new Uint8Array(f64.buffer);

function encodeFloat(num) {
  if (num === fround(num)) {
    f32[0] = num;
    return '\xca'
      + asciiToStr$1[u8f32[3]]
      + asciiToStr$1[u8f32[2]]
      + asciiToStr$1[u8f32[1]]
      + asciiToStr$1[u8f32[0]];
  }

  f64[0] = num;
  return '\xcb'
    + asciiToStr$1[u8f64[7]]
    + asciiToStr$1[u8f64[6]]
    + asciiToStr$1[u8f64[5]]
    + asciiToStr$1[u8f64[4]]
    + asciiToStr$1[u8f64[3]]
    + asciiToStr$1[u8f64[2]]
    + asciiToStr$1[u8f64[1]]
    + asciiToStr$1[u8f64[0]];
}

function encodeFloat32(num) {
  f32[0] = num;
  return '\xca'
    + asciiToStr$1[u8f32[3]]
    + asciiToStr$1[u8f32[2]]
    + asciiToStr$1[u8f32[1]]
    + asciiToStr$1[u8f32[0]];
}

function encodeFloat64(num) {
  f64[0] = num;
  return '\xcb'
    + asciiToStr$1[u8f64[7]]
    + asciiToStr$1[u8f64[6]]
    + asciiToStr$1[u8f64[5]]
    + asciiToStr$1[u8f64[4]]
    + asciiToStr$1[u8f64[3]]
    + asciiToStr$1[u8f64[2]]
    + asciiToStr$1[u8f64[1]]
    + asciiToStr$1[u8f64[0]];
}

function selectEncoderFloat(type) {
  if (type === '64') return encodeFloat64;
  if (type === '32') return encodeFloat32;
  return encodeFloat;
}

class Ext {
  constructor(type, bin) {
    this.type = type;
    this.bin = bin;
  }
}

const isArray = Array.isArray;
const objectKeys = Object.keys;

const Bool = 'boolean';
const Num = 'number';
const Obj = 'object';
const Str = 'string';

class Encoder {
  constructor({
    handler=throwsEncoderHandler,
    float='64',
    objectKeys='ascii',
    codecs=false,
  } = {}) {
    this.u = handler.bind(this);
    this.encodeFloat = selectEncoderFloat(float);
    this.encodeBigInt = this.encodeInt;
    this.e = (objectKeys === 'ascii') ? encodeAscii : this.encodeStr;
    this.c = codecs;
  }

  encode(value) {
    switch (typeof value) {
      case Str:
        return this.encodeStr(value);
      case Num:
        return (value % 1 === 0) ? this.encodeInt(value) : this.encodeFloat(value);
      case Obj:
        if (value === null) return '\xc0';
        if (isArray(value)) return this.encodeArray(value);
        if (value.constructor == ArrayBuffer) return this.encodeBin(value);
        if (value.constructor == Ext) return this.encodeExt(value.type, value.bin);
        if (this.c) {
          let bin, i = this.c.length;
          while (i > 0) {
            bin = this.c[i -= 1].encode(this, value);
            if (bin !== null) return bin;
          }
        }
        return this.encodeObject(value);
      case Bool:
        return value ? '\xc3' : '\xc2';

      default:
        return this.u(value);
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
        return asciiToStr$1[num & 0xff];
      }
      // int 8
      if (num > -0x81) {
        return '\xd0'
          + asciiToStr$1[num & 0xff];
      }
      // int 16
      if (num > -0x8001) {
        return '\xd1'
          + asciiToStr$1[num >> 8 & 0xff]
          + asciiToStr$1[num & 0xff];
      }
      // int 32
      if (num > -0x80000001) {
        return '\xd2'
          + asciiToStr$1[num >> 24 & 0xff]
          + asciiToStr$1[num >> 16 & 0xff]
          + asciiToStr$1[num >> 8 & 0xff]
          + asciiToStr$1[num & 0xff];
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
      return asciiToStr$1[num];
    }
    // uint 8
    if (num < 0x100) {
      return '\xcc'
        + asciiToStr$1[num];
    }
    // uint 16
    if (num < 0x10000) {
      return '\xcd'
        + asciiToStr$1[num >> 8]
        + asciiToStr$1[num & 0xff];
    }
    // uint 32
    if (num < 0x100000000) {
      return '\xce'
        + asciiToStr$1[num >> 24 & 0xff]
        + asciiToStr$1[num >> 16 & 0xff]
        + asciiToStr$1[num >> 8 & 0xff]
        + asciiToStr$1[num & 0xff];
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

  encodeStr(str) {
    let len = str.length;
    if (len === 0) return '\xa0';

    const bin = utf8toBin(str);
    len = bin.length;

    // fixstr
    if (len < 0x20) {
      return asciiToStr$1[len | 0xa0]
        + bin;
    }
    // str 8
    if (len < 0x100) {
      return '\xd9'
        + asciiToStr$1[len]
        + bin;
    }
    // str 16
    if (len < 0x10000) {
      return '\xda'
        + asciiToStr$1[len >> 8]
        + asciiToStr$1[len & 0xff]
        + bin;
    }
    // str 32
    return '\xdb'
      + asciiToStr$1[len >> 24 & 0xff]
      + asciiToStr$1[len >> 16 & 0xff]
      + asciiToStr$1[len >> 8 & 0xff]
      + asciiToStr$1[len & 0xff]
      + bin;
  }

  encodeBin(buf) {
    const len = buf.length;
    if (len === 0) return '\xc4\x00';

    let bin = '';
      for (let i = 0; i < len; i++) {
        bin += asciiToStr$1[buf[i]];
      }

    // bin 16
    if (len < 0x10000) {
      return '\xc5'
        + asciiToStr$1[len >> 8]
        + asciiToStr$1[len & 0xff]
        + bin;
    }
    // bin 32
    return '\xc6'
      + asciiToStr$1[len >> 24 & 0xff]
      + asciiToStr$1[len >> 16 & 0xff]
      + asciiToStr$1[len >> 8 & 0xff]
      + asciiToStr$1[len & 0xff]
      + bin;
  }

  encodeArray(arr) {
    const len = arr.length;
    if (len === 0) return '\x90';

    let bin;
    if (len < 0x10) { // fixarray
      bin = asciiToStr$1[0x90 | len];
    } else if (len < 0x10000) { // array 16
      bin = '\xdc'
        + asciiToStr$1[len >> 8]
        + asciiToStr$1[len & 0xff];
    } else { // array 32
      bin = '\xdd'
        + asciiToStr$1[len >> 24 & 0xff]
        + asciiToStr$1[len >> 16 & 0xff]
        + asciiToStr$1[len >> 8 & 0xff]
        + asciiToStr$1[len & 0xff];
    }

    for (let i = 0; i < len; i++) {
      bin += this.encode(arr[i]);
    }

    return bin;
  }

  encodeObject(obj) {
    const keys = objectKeys(obj);
    const len = keys.length;
    if (len === 0) return '\x80';

    let bin;
    if (len < 0x10) { // fixmap
      bin = asciiToStr$1[0x80 | len];
    } else if (len < 0x10000) { // map 16
      bin = '\xde'
        + asciiToStr$1[len >> 8]
        + asciiToStr$1[len & 0xff];
    } else { // map 32
      bin = '\xdf'
        + asciiToStr$1[len >> 24 & 0xff]
        + asciiToStr$1[len >> 16 & 0xff]
        + asciiToStr$1[len >> 8 & 0xff]
        + asciiToStr$1[len & 0xff];
    }

    for (let key, i = 0; i < len; i++) {
      key = keys[i];
      bin += this.e(key);
      bin += this.encode(obj[key]);
    }

    return bin;
  }

  encodeExt(type, bin) {
    const ext = asciiToStr$1[type & 0x7f] + bin;
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
        + asciiToStr$1[len]
        + ext;
    }
    // ext 16
    if (len < 0x10000) {
      return '\xc8'
        + asciiToStr$1[len >> 8]
        + asciiToStr$1[len & 0xff]
        + ext;
    }
    // ext 32
    return '\xc9'
      + asciiToStr$1[len >> 24 & 0xff]
      + asciiToStr$1[len >> 16 & 0xff]
      + asciiToStr$1[len >> 8 & 0xff]
      + asciiToStr$1[len & 0xff]
      + ext;
  }
}

const u32f32 = new Uint32Array(f32.buffer);
const u32f64 = new Uint32Array(f64.buffer);

class Decoder {
  constructor({
    handler=throwsDecoderHandler,
    codecs=false,
  } = {}) {
    this.u = handler.bind(this);
    this.c = codecs ? packCodecs(codecs) : false;
    this.b = null;
    this.o = 0;
    this.l = 0;
  }

  decode(buffer, start=0, end=buffer.length) {
    this.b = buffer;
    this.o = start;
    this.l = start + end;

    return this.parse();
  }

  parse() {
    if (this.l < this.o + 1) {
      return this.u(1);
    }

    const byte = this.b[this.o];
    this.o += 1;

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

      default: return this.u(0);
    }
  }

  decodeFloat32() {
    if (this.l < this.o + 4) {
      return this.u(4);
    }

    u32f32[0] = this.b[this.o] * 0x1000000
      | this.b[this.o + 1] << 16
      | this.b[this.o + 2] << 8
      | this.b[this.o + 3];

    this.o += 4;

    return f32[0];
  }

  decodeFloat64() {
    if (this.l < this.o + 8) {
      return this.u(8);
    }

    u32f64[1] = this.b[this.o] * 0x1000000
      | this.b[this.o + 1] << 16
      | this.b[this.o + 2] << 8
      | this.b[this.o + 3];

    u32f64[0] = this.b[this.o + 4] * 0x1000000
      | this.b[this.o + 5] << 16
      | this.b[this.o + 6] << 8
      | this.b[this.o + 7];

    this.o += 8;

    return f64[0];
  }

  decodeUint8() {
    if (this.l < this.o + 1) {
      return this.u(1);
    }

    const num = this.b[this.o];

    this.o += 1;

    return num;
  }

  decodeUint16() {
    if (this.l < this.o + 2) {
      return this.u(2);
    }

    const num = this.b[this.o] << 8
      | this.b[this.o + 1];

    this.o += 2;

    return num;
  }

  decodeUint32() {
    if (this.l < this.o + 4) {
      return this.u(4);
    }

    const num = this.b[this.o] * 0x1000000
      + (this.b[this.o + 1] << 16
        | this.b[this.o + 2] << 8
        | this.b[this.o + 3]);

    this.o += 4;

    return num;
  }

  decodeUint64() {
    if (this.l < this.o + 8) {
      return this.u(8);
    }
    
    const num = this.b[this.o] * 0x1000000
      + (this.b[this.o + 1] << 16
        | this.b[this.o + 2] << 8
        | this.b[this.o + 3]) * 0x100000000
      + this.b[this.o + 4] * 0x1000000
      + (this.b[this.o + 5] << 16
        | this.b[this.o + 6] << 8
        | this.b[this.o + 7]);

    this.o += 8;

    return num;
  }

  decodeInt8() {
    if (this.l < this.o + 1) {
      return this.u(1);
    }

    const num = this.b[this.o] - 0x100;

    this.o += 1;

    return num;
  }

  decodeInt16() {
    if (this.l < this.o + 2) {
      return this.u(2);
    }

    const num = (this.b[this.o] << 8
      | this.b[this.o + 1]) - 0x10000;

    this.o += 2;

    return num;
  }

  decodeInt32() {
    if (this.l < this.o + 4) {
      return this.u(4);
    }

    const num = this.b[this.o] << 24
      | this.b[this.o + 1] << 16
      | this.b[this.o + 2] << 8
      | this.b[this.o + 3];

    this.o += 4;

    return num;
  }

  decodeInt64() {
    if (this.l < this.o + 8) {
      return this.u(8);
    }
    
    const num = (this.b[this.o] << 24
      | this.b[this.o + 1] << 16
      | this.b[this.o + 2] << 8
      | this.b[this.o + 3]) * 0x100000000
      + this.b[this.o + 4] * 0x1000000
      + (this.b[this.o + 5] << 16
        | this.b[this.o + 6] << 8
        | this.b[this.o + 7]);

    this.o += 8;

    return num;
  }

  decodeBin(length) {
    if (this.l < this.o + length) {
      return this.u(length);
    }

    return this.b.slice(this.o, this.o += length);
  }

  decodeStr(length) {
    if (this.l < this.o + length) {
      return this.u(length);
    }

    return binToUtf8(this.b, this.o, this.o += length);
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
    if (this.l < this.o + length) {
      return this.u(length);
    }

    const type = this.b[this.o];
    this.o += 1;

    if (this.c) {
      const codec = this.c.get(type);
      if (codec !== void 0) {
        return codec.decode(this, length);
      }
    }

    return new Ext(
      type,
      this.b.slice(this.o, this.o += length)
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

export { Encoder, Decoder };

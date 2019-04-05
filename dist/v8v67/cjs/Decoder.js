'use strict';

const { binToUtf8 } = require('utf8-bin');
const { throwsDecoderHandler } = require('./handlers');
const { f32, f64, u64, i64 } = require('./binary');
const Ext = require('./Ext');

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

module.exports = Decoder;

'use strict';

const { binToUtf8 } = require('utf8-bin');
const { throwsUnpackerHandler } = require('./handlers');
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

class Unpacker {
  constructor({
    handler=throwsUnpackerHandler,
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

  unpack(buffer, start=0, end=buffer.length) {
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
        return (byte === 0x80) ? {} : this.unpackMap(byte & 0xf);
      }
      // fixarray
      if (byte < 0xa0) {
        return (byte === 0x90) ? [] : this.unpackArray(byte & 0x0f);
      }
      // fixstr
      return (byte === 0xa0) ? '' : this.unpackStr(byte & 0x1f);
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
      case 0xca: return this.unpackFloat32();
      case 0xcb: return this.unpackFloat64();

      // uint 8/16/32/64
      case 0xcc: return this.unpackUint8();
      case 0xcd: return this.unpackUint16();
      case 0xce: return this.unpackUint32();
      case 0xcf: return this.unpackUint64();

      // int 8/16/32/64
      case 0xd0: return this.unpackInt8();
      case 0xd1: return this.unpackInt16();
      case 0xd2: return this.unpackInt32();
      case 0xd3: return this.unpackInt64();

      // str 8/16/32
      case 0xd9: return this.unpackStr(this.unpackUint8());
      case 0xda: return this.unpackStr(this.unpackUint16());
      case 0xdb: return this.unpackStr(this.unpackUint32());

      // array 16/32
      case 0xdc: return this.unpackArray(this.unpackUint16());
      case 0xdd: return this.unpackArray(this.unpackUint32());

      // map 16/32
      case 0xde: return this.unpackMap(this.unpackUint16());
      case 0xdf: return this.unpackMap(this.unpackUint32());

      // bin 8/16/32
      case 0xc4: return this.unpackBin(this.unpackUint8());
      case 0xc5: return this.unpackBin(this.unpackUint16());
      case 0xc6: return this.unpackBin(this.unpackUint32());

      // fixext 1/2/4/8/16
      case 0xd4: return this.unpackExt(1);
      case 0xd5: return this.unpackExt(2);
      case 0xd6: return this.unpackExt(4);
      case 0xd7: return this.unpackExt(8);
      case 0xd8: return this.unpackExt(16);

      // ext 8/16/32
      case 0xc7: return this.unpackExt(this.unpackUint8());
      case 0xc8: return this.unpackExt(this.unpackUint16());
      case 0xc9: return this.unpackExt(this.unpackUint32());

      default: return this.unexpectedLength(0);
    }
  }

  unpackFloat32() {
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

  unpackFloat64() {
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

  unpackUint8() {
    if (this.length <= this.offset) {
      return this.unexpectedLength(1);
    }

    const num = this.buffer[this.offset];

    this.offset += 1;

    return num;
  }

  unpackUint16() {
    if (this.length < this.offset + 2) {
      return this.unexpectedLength(2);
    }

    const num = this.buffer[this.offset] << 8
      | this.buffer[this.offset + 1];

    this.offset += 2;

    return num;
  }

  unpackUint32() {
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

  unpackUint64() {
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

  unpackInt8() {
    if (this.length <= this.offset) {
      return this.unexpectedLength(1);
    }

    const num = this.buffer[this.offset] - 0x100;

    this.offset += 1;

    return num;
  }

  unpackInt16() {
    if (this.length < this.offset + 2) {
      return this.unexpectedLength(2);
    }

    const num = (this.buffer[this.offset] << 8
      | this.buffer[this.offset + 1]) - 0x10000;

    this.offset += 2;

    return num;
  }

  unpackInt32() {
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

  unpackInt64() {
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

  unpackBin(length) {
    if (this.length < this.offset + length) {
      return this.unexpectedLength(length);
    }

    const start = this.buffer.byteOffset + this.offset;
    this.offset += length;

    return new FastBuffer(this.buffer.buffer, start, length);
  }

  unpackStr(length) {
    if (this.length < this.offset + length) {
      return this.unexpectedLength(length);
    }

    return (length < this.bufferLenMin)
      ? binToUtf8(this.buffer, this.offset, this.offset += length)
      : this.buffer.utf8Slice(this.offset, this.offset += length);
  }

  unpackArray(size) {
    const array = new Array(size);
    for (let i = 0; i < size; i++) {
      array[i] = this.parse();
    }

    return array;
  }

  unpackMap(size) {
    const map = {};
    while (size > 0) {
      size -= 1;
      map[this.parse()] = this.parse();
    }

    return map;
  }

  unpackExt(length) {
    if (this.length < this.offset + length) {
      return this.unexpectedLength(length);
    }

    const type = this.buffer[this.offset];
    this.offset += 1;

    if (this.codecs) {
      const codec = this.codecs.get(type);
      if (codec !== void 0) {
        return codec.unpack(this, length);
      }
    }

    return new Ext(
      type,
      this.buffer.latin1Slice(this.offset, this.offset += length)
    );
  }
}

module.exports = Unpacker;

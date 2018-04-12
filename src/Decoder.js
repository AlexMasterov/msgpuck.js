'use strict';

const { DecodingFailed, InsufficientData } = require('./errors');
const { toFloat, toDouble } = require('./ieee754');
const Ext = require('./Ext');

const FastBuffer = Buffer[Symbol.species];

const DEFAULT_OPTIONS = { codecs: [] };

class Decoder {
  constructor(options = DEFAULT_OPTIONS) {
    this.buffer = null;
    this.length = 0;
    this.offset = 0;
    this.codecs = options.codecs;
  }

  decode(buffer) {
    this.buffer = buffer;
    this.length = buffer.length;
    this.offset = 0;

    return this.parse();
  }

  parse() {
    if (this.length < this.offset + 1) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, 1);
    }

    const byte = this.buffer[this.offset++];

    if (byte < 0xc0) {
      // positive fixint
      if (byte < 0x80) {
        return byte;
      }
      // fixmap
      if (byte < 0x90) {
        return byte & 0xf ? this.decodeMap(byte & 0xf) : {};
      }
      // fixarray
      if (byte < 0xa0) {
        return byte & 0x0f ? this.decodeArray(byte & 0x0f) : [];
      }
      // fixstr
      return byte & 0x1f ? this.decodeStr(byte & 0x1f) : '';
    }

    // negative fixint
    if (byte > 0xdf) {
      return byte - 0x100;
    }

    switch (byte) {
      case 0xc0: return null;
      case 0xc2: return false;
      case 0xc3: return true;

      // bin 8/16/32
      case 0xc4: return this.decodeBin(this.decodeUint8());
      case 0xc5: return this.decodeBin(this.decodeUint16());
      case 0xc6: return this.decodeBin(this.decodeUint32());

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

      default:
        throw DecodingFailed.fromOffset(byte, this.offset);
    }
  }

  decodeFloat32() {
    if (this.length < this.offset + 4) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, 4);
    }

    const hi = this.buffer[this.offset] * 0x1000000
        | this.buffer[this.offset + 1] << 16
        | this.buffer[this.offset + 2] << 8
        | this.buffer[this.offset + 3];

    this.offset += 4;

    return toFloat(hi);
  }

  decodeFloat64() {
    if (this.length < this.offset + 8) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, 8);
    }

    const hi = this.buffer[this.offset] * 0x1000000
        | this.buffer[this.offset + 1] << 16
        | this.buffer[this.offset + 2] << 8
        | this.buffer[this.offset + 3];

    const lo = this.buffer[this.offset + 4] * 0x1000000
        | this.buffer[this.offset + 5] << 16
        | this.buffer[this.offset + 6] << 8
        | this.buffer[this.offset + 7];

    this.offset += 8;

    return toDouble(lo, hi);
  }

  decodeUint8() {
    if (this.length < this.offset + 1) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, 1);
    }

    return this.buffer[this.offset++];
  }

  decodeUint16() {
    if (this.length < this.offset + 2) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, 2);
    }

    const num = this.buffer[this.offset] << 8
      | this.buffer[this.offset + 1];

    this.offset += 2;

    return num;
  }

  decodeUint32() {
    if (this.length < this.offset + 4) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, 4);
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
      throw InsufficientData.fromOffset(this.buffer, this.offset, 8);
    }

    const num = this.buffer[this.offset] * 0x1000000
      + (this.buffer[this.offset + 1] << 16
        | this.buffer[this.offset + 2] << 8
        | this.buffer[this.offset + 3]) * 0x100000000
      + this.buffer[this.offset + 4] * 0x1000000
      + (this.buffer[this.offset + 5] << 16
        | this.buffer[this.offset + 6] << 8
        | this.buffer[this.offset + 7]);

    this.offset += 8;

    return num;
  }

  decodeInt8() {
    if (this.length < this.offset + 1) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, 1);
    }

    return this.buffer[this.offset++] - 0x100;
  }

  decodeInt16() {
    if (this.length < this.offset + 2) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, 2);
    }

    const num = (this.buffer[this.offset] << 8
      | this.buffer[this.offset + 1]) - 0x10000;

    this.offset += 2;

    return num;
  }

  decodeInt32() {
    if (this.length < this.offset + 4) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, 4);
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
      throw InsufficientData.fromOffset(this.buffer, this.offset, 8);
    }

    const num = (this.buffer[this.offset] << 24
      | this.buffer[this.offset + 1] << 16
      | this.buffer[this.offset + 2] << 8
      | this.buffer[this.offset + 3]) * 0x100000000
      + this.buffer[this.offset + 4] * 0x1000000
      + (this.buffer[this.offset + 5] << 16
        | this.buffer[this.offset + 6] << 8
        | this.buffer[this.offset + 7]);

    this.offset += 8;

    return num;
  }

  decodeBin(length) {
    if (this.length < this.offset + length) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, length);
    }

    const start = this.buffer.byteOffset + this.offset++;
    this.offset += length;

    return new FastBuffer(this.buffer.buffer, start, length);
  }

  decodeStr(length) {
    if (this.length < this.offset + length) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, length);
    }

    return this.buffer.utf8Slice(
      this.offset++,
      this.offset += length - 1
    );
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
    while (size--) {
      map[this.parse()] = this.parse();
    }

    return map;
  }

  decodeExt(length) {
    if (this.length < this.offset + length) {
      throw InsufficientData.fromOffset(this.buffer, this.offset, length);
    }

    const type = this.buffer[this.offset++];

    if (this.codecs) {
      for (let codec, i = 0; i < this.codecs.length; i++) {
        if (codec = this.codecs[i], codec.type === type) {
          return codec.decode(this.parse());
        }
      }
    }

    return new Ext(type, this.parse());
  }
}

module.exports = Decoder;

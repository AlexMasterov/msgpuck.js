'use strict';

const { CHR, bufToBin, utf8toBin, FastBuffer } = require('./optimizers');
const { EncodingFailed } = require('./errors');
const Ext = require('./Ext');

const isArray = Array.isArray;
const ObjectKeys = Object.keys;
const float32Array = new Float32Array(1);
const float64Array = new Float64Array(1);
const Uint8Float32Array = new Uint8Array(float32Array.buffer);
const Uint8Float64Array = new Uint8Array(float64Array.buffer);

const ALLOC_BYTES = 2048;

function encodeUint64(num) {
  const hi = num / 0x100000000 >> 0;
  const lo = num >>> 0;
  return '\xcf'
    + CHR[hi >> 24 & 0xff]
    + CHR[hi >> 16 & 0xff]
    + CHR[hi >> 8 & 0xff]
    + CHR[hi & 0xff]
    + CHR[lo >> 24 & 0xff]
    + CHR[lo >> 16 & 0xff]
    + CHR[lo >> 8 & 0xff]
    + CHR[lo & 0xff];
}

function encodeInt64(num) {
  const hi = (num / 0x100000000 >> 0) - 1;
  const lo = num >>> 0;
  return '\xd3'
    + CHR[hi >> 24 & 0xff]
    + CHR[hi >> 16 & 0xff]
    + CHR[hi >> 8 & 0xff]
    + CHR[hi & 0xff]
    + CHR[lo >> 24 & 0xff]
    + CHR[lo >> 16 & 0xff]
    + CHR[lo >> 8 & 0xff]
    + CHR[lo & 0xff];
}

class Encoder {
  constructor({ codecs=[], bufferMinlen=15, float32=false } = {}) {
    this.alloc = 0;
    this.buffer = null;
    this.codecs = codecs;
    this.bufferMinlen = bufferMinlen >>> 0;
    if (float32) this.encodeFloat64 = this.encodeFloat32;
  }

  encode(value) {
    switch (typeof value) {
      case 'number':
        return value % 1 === 0 ? this.encodeInt(value) : this.encodeFloat64(value);
      case 'string':
        return this.encodeStr(value);
      case 'boolean':
        return value ? '\xc3' : '\xc2';
      case 'undefined':
        value = { __isUndefined__: true };
      case 'symbol':
      case 'object':
        if (value === null) return '\xc0';
        if (isArray(value)) return this.encodeArray(value);
        if (value.constructor === Buffer) return this.encodeBin(value);
        if (value.constructor === Ext) return this.encodeExt(value);
        if (this.codecs) {
          for (let codec, i = 0; i < this.codecs.length; i++) {
            if (codec = this.codecs[i], codec.supports(value)) {
              return this.encodeExt(new Ext(codec.type, codec.encode(value)));
            }
          }
        }
        return this.encodeObject(value);

      default:
        throw EncodingFailed.withValue(value);
    }
  }

  encodeNil() {
    return '\xc0';
  }

  encodeBool(value) {
    return value ? '\xc3' : '\xc2';
  }

  encodeFloat32(num) {
    float32Array[0] = num;

    return '\xca'
      + CHR[Uint8Float32Array[3]]
      + CHR[Uint8Float32Array[2]]
      + CHR[Uint8Float32Array[1]]
      + CHR[Uint8Float32Array[0]];
  }

  encodeFloat64(num) {
    float64Array[0] = num;

    return '\xcb'
      + CHR[Uint8Float64Array[7]]
      + CHR[Uint8Float64Array[6]]
      + CHR[Uint8Float64Array[5]]
      + CHR[Uint8Float64Array[4]]
      + CHR[Uint8Float64Array[3]]
      + CHR[Uint8Float64Array[2]]
      + CHR[Uint8Float64Array[1]]
      + CHR[Uint8Float64Array[0]];
  }

  encodeInt(num) {
    if (num < 0) {
      // negative fixint
      if (num > -0x21) {
        return CHR[num & 0xff];
      }
      // int 8
      if (num > -0x81) {
        return '\xd0'
          + CHR[num & 0xff];
      }
      // int 16
      if (num > -0x8001) {
        return '\xd1'
          + CHR[num >> 8 & 0xff]
          + CHR[num & 0xff];
      }
      // int 32
      if (num > -0x80000001) {
        return '\xd2'
          + CHR[num >> 24 & 0xff]
          + CHR[num >> 16 & 0xff]
          + CHR[num >> 8 & 0xff]
          + CHR[num & 0xff];
      }
      // int 64
      if (num > -0x20000000000001) {
        return encodeInt64(num);
      }
      // -Infinity
      return '\xcb\xff\xf0\x00\x00\x00\x00\x00\x00';
    }
    // positive fixint
    if (num < 0x80) {
      return CHR[num];
    }
    // uint 8
    if (num < 0x100) {
      return '\xcc'
        + CHR[num];
    }
    // uint 16
    if (num < 0x10000) {
      return '\xcd'
        + CHR[num >> 8]
        + CHR[num & 0xff];
    }
    // uint 32
    if (num < 0x100000000) {
      return '\xce'
        + CHR[num >> 24 & 0xff]
        + CHR[num >> 16 & 0xff]
        + CHR[num >> 8 & 0xff]
        + CHR[num & 0xff];
    }
    // uint 64
    if (num < 0x20000000000000) {
      return encodeUint64(num);
    }
    // Infinity
    return '\xcb\x7f\xf0\x00\x00\x00\x00\x00\x00';
  }

  encodeStr(str) {
    let len = str.length, bin = '\xa0';
    if (len === 0) return bin;

    if (len < this.bufferMinlen) {
      bin = utf8toBin(str);
      len = bin.length;
    } else {
      if (len > this.alloc) {
        this.alloc = ALLOC_BYTES * ((len | ALLOC_BYTES) / 896 >> 0);
        this.buffer = new FastBuffer(this.alloc);
      }
      len = this.buffer.utf8Write(str, 0);
      bin = this.buffer.latin1Slice(0, len);
    }

    // fixstr
    if (len < 0x20) {
      return CHR[len | 0xa0]
        + bin;
    }
    // str 8
    if (len < 0x100) {
      return '\xd9'
        + CHR[len]
        + bin;
    }
    // str 16
    if (len < 0x10000) {
      return '\xda'
        + CHR[len >> 8]
        + CHR[len & 0xff]
        + bin;
    }
    // str 32
    return '\xdb'
      + CHR[len >> 24]
      + CHR[len >> 16]
      + CHR[len >> 8]
      + CHR[len & 0xff]
      + bin;
  }

  encodeBin(buf) {
    const len = buf.length;
    if (len === 0) return '\xc4\x00';

    const bin = len < 7
      ? bufToBin(buf, len)
      : buf.latin1Slice(0, len);

    // bin 8
    if (len < 0x100) {
      return '\xc4'
        + CHR[len]
        + bin;
    }
    // bin 16
    if (len < 0x10000) {
      return '\xc5'
        + CHR[len >> 8]
        + CHR[len & 0xff]
        + bin;
    }
    // bin 32
    return '\xc6'
      + CHR[len >> 24]
      + CHR[len >> 16]
      + CHR[len >> 8]
      + CHR[len & 0xff]
      + bin;
  }

  encodeArray(arr) {
    const len = arr.length;
    if (len === 0) return '\x90';

    let data;
    if (len < 0x10) { // fixarray
      data = CHR[0x90 | len];
    } else if (len < 0x10000) { // array 16
      data = '\xdc'
        + CHR[len >> 8]
        + CHR[len & 0xff];
    } else { // array 32
      data = '\xdd'
        + CHR[len >> 24]
        + CHR[len >> 16]
        + CHR[len >> 8]
        + CHR[len & 0xff];
    }

    for (let i = 0; i < len; i++) {
      data += this.encode(arr[i]);
    }

    return data;
  }

  encodeObject(obj) {
    const keys = ObjectKeys(obj);
    const len = keys.length;
    if (len === 0) return '\x80';

    let data;
    if (len < 0x10) { // fixmap
      data = CHR[0x80 | len];
    } else if (len < 0x10000) { // map 16
      data = '\xde'
        + CHR[len >> 8]
        + CHR[len & 0xff];
    } else { // map 32
      data = '\xdf'
        + CHR[len >> 24]
        + CHR[len >> 16]
        + CHR[len >> 8]
        + CHR[len & 0xff];
    }

    for (let key, i = 0; i < len; i++) {
      key = keys[i];
      data += this.encodeStr(key);
      data += this.encode(obj[key]);
    }

    return data;
  }

  encodeMap(map) {
    const size = map.size;
    if (size === 0) return '\x80';

    let data;
    if (size < 0x10) { // fixmap
      data = CHR[0x80 | size];
    } else if (size < 0x10000) { // map 16
      data = '\xde'
        + CHR[size >> 8]
        + CHR[size & 0xff];
    } else { // map 32
      data = '\xdf'
        + CHR[size >> 24]
        + CHR[size >> 16]
        + CHR[size >> 8]
        + CHR[size & 0xff];
    }

    for (const [key, value] of map) {
      data += this.encode(key);
      data += this.encode(value);
    }

    return data;
  }

  encodeExt(ext) {
    const type = CHR[ext.type & 0x7f];
    const data = this.encode(ext.data);
    const len = data.length - 1; // trim type byte

    // fixext 1/2/4/8/16
    switch (len) {
      case 1: return '\xd4' + type + data;
      case 2: return '\xd5' + type + data;
      case 4: return '\xd6' + type + data;
      case 8: return '\xd7' + type + data;
      case 16: return '\xd8' + type + data;
    }
    // ext 8
    if (len < 0x100) {
      return '\xc7'
        + CHR[len]
        + type + data;
    }
    // ext 16
    if (len < 0x10000) {
      return '\xc8'
        + CHR[len >> 8]
        + CHR[len & 0xff]
        + type + data;
    }
    // ext 32
    return '\xc9'
      + CHR[len >> 24 & 0xff]
      + CHR[len >> 16 & 0xff]
      + CHR[len >> 8 & 0xff]
      + CHR[len & 0xff]
      + type + data;
  }
}

module.exports = Encoder;

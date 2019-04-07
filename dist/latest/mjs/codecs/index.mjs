import { k as encodeMapHeader } from '../encoders/index-ef1c553f.mjs';

class Codec {
  static get type() {
    return 0x00;
  }

  constructor(type = new.target.type) {
    this.type = type;
  }
}

const objectEntries = Object.entries;

class MapCodec extends Codec {
  static get type() {
    return 0x0c;
  }

  encode(encoder, value) {
    if (value.constructor != Map) return null;

    let bin = encodeMapHeader(value.size);
    for (const [key, val] of value) {
      bin += encoder.encode(key);
      bin += encoder.encode(val);
    }

    return encoder.encodeExt(this.type, bin);
  }

  decode(decoder, length) {
    return new Map(objectEntries(decoder.parse()));
  }
}

const toString = String.prototype.toString;
const booleanValueOf = Boolean.prototype.valueOf;

class ScalarObjectCodec {
  encode(encoder, value) {
    switch (value.constructor) {
      case Number: return encoder.encodeInt(value);
      case String: return encoder.encodeStr(toString.call(value));
      case Boolean: return booleanValueOf.call(value) ? '\xc3' : '\xc2';
      default: return null;
    }
  }
}

export { Codec, MapCodec, ScalarObjectCodec };

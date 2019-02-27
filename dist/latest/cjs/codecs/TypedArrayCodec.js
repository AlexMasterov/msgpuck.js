'use strict';

const Codec = require('../Codec');
const { CHR } = require('../binary');

const isView = ArrayBuffer.isView;
const FastBuffer = Buffer[Symbol.species];

function encodeType(buf) {
  switch (buf.constructor) {
    case Int8Array: return '\x01';
    case Uint8Array: return '\x02';
    case Int16Array: return '\x03';
    case Uint16Array: return '\x04';
    case Int32Array: return '\x05';
    case Uint32Array: return '\x06';
    case Float32Array: return '\x07';
    case Float64Array: return '\x08';
  }
}

class TypedArrayCodec extends Codec {
  static get type() {
    return 0x0e;
  }

  encode(encoder, value) {
    if (!isView(value)) return null;

    const type = encodeType(value);

    // const i8 = new Uint8Array(value.buffer);
    const i8 = new Int8Array(value.buffer);

    // const i8 = new FastBuffer(value.buffer);
    // console.log(i8);

    // console.log(i8);
    // console.log(i8.length);

    let bin = '';
    for (let i = 0; i < i8.length; i++) {
      // console.log(i8[i]);
      bin += CHR(i8[i]);
    }

    // const a = Buffer.allocUnsafe(4);
    // a[0] = 51;
    // console.log(a[0]);

    // bin = i8.latin1Slice(0, i8.length);

    // console.log(Buffer.from(bin, 'binary'));
    // console.log(bin);

    return encoder.encodeExt(this.type, type + bin);
  }

  decode(decoder, length) {
    const buffer = decoder.buffer;
    const type = buffer[decoder.offset];

    decoder.offset += 1;

    const b = buffer.buffer
      .slice(
        buffer.byteOffset + 4,
        buffer.byteOffset + buffer.byteLength
      );

    length -= 1;

    console.log(b);

    console.log(new Uint8Array(b));
    console.log(new Uint8Array(buffer.buffer, buffer.byteOffset + 4, length));

    switch (type) {
      // case 1: return new Uint8Array(buffer.buffer, buffer.byteOffset + 4, length);
      // case 1: return new Int8Array(buffer.buffer, buffer.byteOffset + 4, length);

      case 1: return new Int8Array(b);

      // case 2: return new Uint8Array(b);
      case 3: return new Int16Array(b);
      case 4: return new Uint16Array(b);
      case 5: return new Int32Array(b);
      case 6: return new Uint32Array(b);
      case 7: return new Float32Array(b);
      case 8: return new Float64Array(b);
      default: return null;
    }
  }
}

module.exports = TypedArrayCodec;

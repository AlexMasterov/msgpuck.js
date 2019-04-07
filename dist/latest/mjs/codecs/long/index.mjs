import { j as encodeInt64 } from '../../encoders/index-ef1c553f.mjs';
import Long from 'long';

class LongCodec {
  encode(encoder, value) {
    if (value.__isLong__ === false) return null;

    return (value.high < 0 ? '\xd3' : '\xcf')
      + encodeInt64(value.low, value.high);
  }
}

function decodeLong() {
  if (this.length < this.offset + 8) {
    return this.unexpectedLength(8);
  }

  const num = new Long(
    this.buffer[this.offset] << 24
    | this.buffer[this.offset + 1] << 16
    | this.buffer[this.offset + 2] << 8
    | this.buffer[this.offset + 3],
    this.buffer[this.offset + 4] << 24
    | this.buffer[this.offset + 5] << 16
    | this.buffer[this.offset + 6] << 8
    | this.buffer[this.offset + 7]
  );

  this.offset += 8;

  return num;
}

export { LongCodec, decodeLong as LongDecode };

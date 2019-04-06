import { h as _require___$__$encoders_ } from '../../encoders/index-b754015a.mjs';
import Long from 'long';

const { encodeInt64 } = _require___$__$encoders_;

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

const LongCodec$1 = (class LongCodec$1 {
  static get LongCodec() { return LongCodec; }
  static get LongDecode() { return decodeLong; }
});

export default LongCodec$1;

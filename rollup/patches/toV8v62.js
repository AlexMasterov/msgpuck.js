import path from 'path';

const uint64 = `
    const num = this.buffer[this.offset] * 0x1000000
      + (this.buffer[this.offset + 1] << 16
        | this.buffer[this.offset + 2] << 8
        | this.buffer[this.offset + 3]) * 0x100000000
      + this.buffer[this.offset + 4] * 0x1000000
      + (this.buffer[this.offset + 5] << 16
        | this.buffer[this.offset + 6] << 8
        | this.buffer[this.offset + 7]);
`;

const int64 = `
    const num = (this.buffer[this.offset] << 24
      | this.buffer[this.offset + 1] << 16
      | this.buffer[this.offset + 2] << 8
      | this.buffer[this.offset + 3]) * 0x100000000
      + this.buffer[this.offset + 4] * 0x1000000
      + (this.buffer[this.offset + 5] << 16
        | this.buffer[this.offset + 6] << 8
        | this.buffer[this.offset + 7]);
`;

const removeBigIntFromDecoder = code => code
// decodeUint64
  .replace(/\s+u32u64\[1\][^;]+;\r\n/, '')
  .replace(/u32u64\[0\][^;]+;\r\n/, uint64)
  .replace(/(return) u64\[[01]\]/, '$1 num')
// decodeInt64
  .replace(/\s+u32i64\[1\][^;]+;\r\n/g, '')
  .replace(/u32i64\[0\][^;]+;\r\n/g, int64)
  .replace(/(return) i64\[[01]\]/, '$1 num')
// types
  .replace(/,?[\s]+(u|i)64,?/g, '')
  .replace(/\s+const (u|i)32(u|i)64[^;]+;/g, '');

const fromCharCodeToCHR = code => code
  .replace(/(const CHR) = [^;]+;/, `$1 = require('ascii-chr')`)
  .replace(/(CHR)\((.+)\)/g, '$1[$2]');

const removeBigIntFromEncoder = code => code
  .replace(/\s+case BigNum[^;]+/, '')
// encodeBigInt => encodeInt
  .replace(/\s+encodeBigInt\(.+[^}]+}[^}]+}/, '')
  .replace(/(\s+this.encodeFloat[^;]+;)/, '$1\r\n    this.encodeBigInt = this.encodeInt;')
// types
  .replace(/,?[\s]+(u|i)64,?/g, '')
  .replace(/\s+const (u|i)8(u|i)64[^;]+;/g, '');

const removeBigIntArray = code => code
  .replace(/\s+const (u|i)64[^;]+;/g, '')
  .replace(/[\s]+(u|i)64,?/g, '');

export default {
  transform(code, id) {
    const { name } = path.parse(id);

    switch (name) {
      case 'Encoder':
      case 'binary':
      case 'encodeAscii':
      case 'encodeInt64':
      case 'encodeMapHeader':
      case 'selectEncoderFloat':
        code = fromCharCodeToCHR(code);
    }

    switch (name) {
      case 'Encoder': return removeBigIntFromEncoder(code);
      case 'Decoder': return removeBigIntFromDecoder(code);
      case 'binary': return removeBigIntArray(code);
    }

    return code;
  },
};

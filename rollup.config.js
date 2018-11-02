const patcher = (input, file, patch) =>
  ({ input, output: { dir: 'src/legacy', file, format: 'cjs' }, plugins: [patch] });

export default [
  patcher('./src/Encoder.js', 'Encoder.js', patchEncoder()),
  patcher('./src/Decoder.js', 'Decoder.js', patchDecoder()),
];

function patchEncoder() {
  return {
    transform(code) {
      return code
        .replace(/\.\/(handlers|Ext)/g, '../$1')
      // CHR() => CHR[]
        .replace(/(CHR)\((.+)\)/g, '$1[$2]')
      // types
        .replace(/[, ]+u64[, ]/, ' ')
        .replace(/[, ]+i64[, ]/, ' ')
        .replace(/const (u8u64|i8i64|BigNum)(?:[^;]+)/g, '')
      // encodeBigInt => encodeInt
        .replace(/(this.codecs.+);/, 'this.encodeBigInt = this.encodeInt;\r\n    $1')
        .replace(/\s+case ('bigint'|BigNum)(?:[^;]+)/, '')
        .replace(/if \(bignum < 0\)[^}]+}\r\n/, '')
        .replace(/\s+encodeBigInt\(bignum\)[^}]+}/, '');
    },
  };
}

function patchDecoder() {
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

  return {
    transform(code) {
      return code
        .replace(/\.\/(handlers|Ext)/g, '../$1')
      // types
        .replace(/[, ]+u64[, ]+/, ' ')
        .replace(/[, ]+i64[, ]+/, ' ')
        .replace(/const (u32u64|u32i64)(?:[^;]+)/g, '')
      // decodeUint64
        .replace(/\s+u32u64\[1\][^;]+;\r\n/g, '')
        .replace(/u32u64\[0\][^;]+;\r\n/g, uint64)
        .replace(/(return) u64\[0\]/, '$1 num')
      // decodeInt64
        .replace(/\s+u32i64\[1\][^;]+;\r\n/g, '')
        .replace(/u32i64\[0\][^;]+;\r\n/g, int64)
        .replace(/(return) i64\[0\]/, '$1 num');
    },
  };
}

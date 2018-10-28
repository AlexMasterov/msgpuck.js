const patcher = (input, file, patch) =>
  ({ input, output: { dir: 'src', file, format: 'cjs' }, plugins: [patch] });

export default [
  patcher('./src/Encoder.js', 'Encoder.legacy.js', patchEncoder()),
  patcher('./src/Decoder.js', 'Decoder.legacy.js', patchDecoder()),
];

function patchEncoder() {
  return {
    transform(code) {
      return code
      // CHR() => CHR[]
        .replace(/(CHR)\((.+)\)/g, '$1[$2]')
      // types
        .replace(/[, ]+u64[, ]/, ' ')
        .replace(/[, ]+i64[, ]/, ' ')
        .replace(/const (u8u64|i8i64).+\r\n/g, '')
      // encodeBigInt => encodeInt
        .replace(/(this.codecs.+);/, 'this.encodeBigInt = this.encodeInt;\r\n    $1')
        .replace(/case 'bigint':[^;]+;\r\n/, '')
        .replace(/if \(bignum < 0\)[^}]+}\r\n/, '')
        .replace(/encodeBigInt\(bignum\)[^}]+}\r\n/, '');
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
      // types
        .replace(/[, ]u64[, ]/, '')
        .replace(/[, ]i64[, ]/, '')
        .replace(/const (u32u64|u32i64).+\r\n/g, '')
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

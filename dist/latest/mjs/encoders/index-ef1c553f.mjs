const charCode = String.fromCharCode;

const makeCharCodes = (n = 257) => {
  const chr = new Array(n);
  // 1 byte
  while (n > 0) {
    chr[n -= 1] = charCode(n & 0xff);
  }
  return chr;
};

const makeCharCodes2 = (n = 2048) => {
  const chr = new Array(n);
  chr[n] = '\x00';
  // 2 bytes
  while (n > 0x80) {
    chr[n -= 1] = charCode(
      0xc0 | n >> 6 & 0x1f,
      0x80 | n & 0x3f);
  }
  // 1 byte
  while (n > 0) {
    chr[n -= 1] = charCode(n);
  }

  return chr;
};

const charCodes = makeCharCodes();

const charCodes2 = makeCharCodes2();

const codePoint = String.fromCodePoint;

const u8 = new Uint8Array(8);
const f32 = new Float32Array(1);
const f64 = new Float64Array(1);
const u64 = new BigUint64Array(1);
const i64 = new BigInt64Array(1);

const encodeAscii = (str) => {
  const len = str.length;
  // fixstr
  if (len < 0x20) {
    return charCode(len | 0xa0)
      + str;
  }
  // str 8
  if (len < 0x100) {
    return '\xd9'
      + charCode(len)
      + str;
  }
  // str 16
  if (len < 0x10000) {
    return '\xda'
      + charCode(len >> 8)
      + charCode(len & 0xff)
      + str;
  }
  // str 32
  return '\xdb'
    + charCode(len >> 24 & 0xff)
    + charCode(len >> 16 & 0xff)
    + charCode(len >> 8 & 0xff)
    + charCode(len & 0xff)
    + str;
};

const encodeInt64 = (hi, lo) =>
  charCode(hi >> 24 & 0xff)
    + charCode(hi >> 16 & 0xff)
    + charCode(hi >> 8 & 0xff)
    + charCode(hi & 0xff)
    + charCode(lo >> 24 & 0xff)
    + charCode(lo >> 16 & 0xff)
    + charCode(lo >> 8 & 0xff)
    + charCode(lo & 0xff);

const encodeMapHeader = (len) => {
  if (len === 0) return '\x80';
  // fixmap
  if (len < 0x10) {
    return charCode(0x80 | len);
  }
  // map 16
  if (len < 0x10000) {
    return '\xde'
      + charCode(len >> 8)
      + charCode(len & 0xff);
  }
  // map 32
  return '\xdf'
    + charCode(len >> 24 & 0xff)
    + charCode(len >> 16 & 0xff)
    + charCode(len >> 8 & 0xff)
    + charCode(len & 0xff);
};

const fround = Math.fround;
const u8f32 = new Uint8Array(f32.buffer);
const vu8 = new DataView(u8.buffer);

const encodeFloat = (num) => {
  if (num === fround(num)) {
    f32[0] = num;
    return '\xca'
      + charCode(u8f32[3])
      + charCode(u8f32[2])
      + charCode(u8f32[1])
      + charCode(u8f32[0]);
  }

  vu8.setFloat64(0, num);
  return '\xcb'
    + charCode(u8[0])
    + charCode(u8[1])
    + charCode(u8[2])
    + charCode(u8[3])
    + charCode(u8[4])
    + charCode(u8[5])
    + charCode(u8[6])
    + charCode(u8[7]);
};

const encodeFloat32 = (num) => {
  f32[0] = num;
  return '\xca'
    + charCode(u8f32[3])
    + charCode(u8f32[2])
    + charCode(u8f32[1])
    + charCode(u8f32[0]);
};

const encodeFloat64 = (num) => {
  vu8.setFloat64(0, num);
  return '\xcb'
    + charCode(u8[0])
    + charCode(u8[1])
    + charCode(u8[2])
    + charCode(u8[3])
    + charCode(u8[4])
    + charCode(u8[5])
    + charCode(u8[6])
    + charCode(u8[7]);
};

const selectEncoderFloat = (type) => {
  if (type === '64') return encodeFloat64;
  if (type === '32') return encodeFloat32;
  return encodeFloat;
};

export { charCode as a, codePoint as b, charCodes2 as c, f32 as d, f64 as e, u64 as f, i64 as g, selectEncoderFloat as h, encodeAscii as i, encodeInt64 as j, encodeMapHeader as k };

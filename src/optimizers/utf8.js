'use strict';

const CHR = require('ascii-chr');

const fromCodePoint = String.fromCodePoint;
const CHAR_CONTROL = '\u0080';

function utf8toBin(str) {
  let bin = '';
  for (let c, i = 0; i < str.length; i++) {
    c = str[i];

    if (c < CHAR_CONTROL) { // 1 byte
      bin += c;
    } else if (c = c.codePointAt(0), c < 0x800) { // 2 bytes
      bin += CHR[0xc0 | c >> 6 & 0x1f];
      bin += CHR[0x80 | c & 0x3f];
    } else { // 3-4 bytes
      bin += CHR[0xe0 | c >> 12 & 0x0f];
      bin += CHR[0x80 | c >> 6 & 0x3f];
      bin += CHR[0x80 | c & 0x3f];
    }
  }

  return bin;
}

function bufToUtf8(buf, offset, length) {
  let str = '';
  for (let c, i = offset; i < length; i++) {
    c = buf[i];

    if (c < 0x80) { // 1 byte
      str += fromCodePoint(c);
    } else if (c < 0xe0) { // 2 bytes
      str += fromCodePoint(
        (c & 0x1f) << 6
        | buf[++i] & 0x3f);
    } else { // 3-4 bytes
      str += fromCodePoint(
        (c & 0x0f) << 12
        | (buf[i + 1] & 0x3f) << 6
        | buf[i + 2] & 0x3f);
      i += 2;
    }
  }

  return str;
}

module.exports = class utf8 {
  static get bufToUtf8() { return bufToUtf8; }
  static get utf8toBin() { return utf8toBin; }
};

'use strict';

const fromCodePoint = String.fromCodePoint;

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

module.exports = bufToUtf8;

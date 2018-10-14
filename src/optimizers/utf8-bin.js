'use strict';

const CHR = require('ascii-chr');
const CHR2 = require('./utf8-chr2');

const CHAR_CONTROL = '\u0080';

function utf8toBin(str) {
  let bin = '';
  for (let c, i = 0; i < str.length; i++) {
    c = str[i];

    if (c < CHAR_CONTROL) { // 1 byte
      bin += c;
    } else if (c = c.codePointAt(0), c < 0x800) { // 2 bytes
      bin += CHR2[c];
    } else { // 3-4 bytes
      bin += CHR[0xe0 | c >> 12 & 0x0f];
      bin += CHR[0x80 | c >> 6 & 0x3f];
      bin += CHR[0x80 | c & 0x3f];
    }
  }

  return bin;
}

module.exports = utf8toBin;

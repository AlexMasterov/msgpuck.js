'use strict';

const CHR = require('ascii-chr');

function bufToBin(buf, len) {
  let bin = '';
  for (let i = 0; i < len; i++) {
    bin += CHR[buf[i]];
  }

  return bin;
}

module.exports = bufToBin;

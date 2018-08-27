'use strict';

const CHR = require('./ascii');

function bufToBin(buf, len=buf.length) {
  let bin = '';
  for (let i = 0; i < len; i++) {
    bin += CHR[buf[i]];
  }

  return bin;
}

module.exports = bufToBin;

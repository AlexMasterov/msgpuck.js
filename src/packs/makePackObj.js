'use strict';

const { CHR } = require('../binary');

const makePackObj = (pack, packObjKey, objKeys) =>
  (obj) => {
    const keys = objKeys(obj);
    const len = keys.length;
    if (len === 0) return '\x80';

    let bin;
    if (len < 0x10) { // fixmap
      bin = CHR(0x80 | len);
    } else if (len < 0x10000) { // map 16
      bin = '\xde'
        + CHR(len >> 8)
        + CHR(len & 0xff);
    } else { // map 32
      bin = '\xdf'
        + CHR(len >> 24 & 0xff)
        + CHR(len >> 16 & 0xff)
        + CHR(len >> 8 & 0xff)
        + CHR(len & 0xff);
    }

    for (let key, i = 0; i < len; i++) {
      key = keys[i];
      bin += packObjKey(key);
      bin += pack(obj[key]);
    }

    return bin;
  };

module.exports = makePackObj;

'use strict';

const { indexPatch } = require('./node');
const optimize = require('../optimizers');

const encodeStr = `
    const bin = utf8toBin(str);
    len = bin.length;
`;

const encodeBin = `
    let bin = '';
    for (let i = 0; i < len; i++) {
      bin += CHR(buf[i]);
    }
`;

const removeBufferFromEncoder = code => code
// constructor
  .replace(/[\s]+const (?:alloc|isBuffer) = [^;]+;/g, '')
  .replace(/[\s]+buffer(?:LenMin|AllocMin|Case)=[^,]+,/g, '')
  .replace(/[\s]+this.buffer(?:Alloc|LenMin|AllocMin)? = [^;]+;/g, '')
  .replace(/[\s]+this.isBuffer = [^;]+;/g, '')
// ArrayBuffer
  .replace(/\(this.isBuffer\((.+)\)\)/g, '($1.constructor == ArrayBuffer)')
// encodeStr
  .replace(/(str.length), bin/, '$1')
  .replace(/\s{1,5}if \(len < this.bufferLenMin\).*[^//]+\n/, encodeStr)
// encodeBin
  .replace(/\s{1,5}let bin;.*[^//]*\n/, encodeBin)
;

const removeBufferFromDecoder = code => code
// constructor
  .replace(/[\s]+bufferLenMin=[^,]+,/, '')
  .replace(/[\s]+this.bufferLenMin = [^;]+;/, '')
// decodeStr
  .replace(/\(length < this.bufferLenMin\)[^}]+;/,
    'binToUtf8(this.buffer, this.offset, this.offset += length);')
// decodeBin
  .replace(/[\s]?const FastBuffer[^;]+;/, '')
  .replace(/new FastBuffer/, 'new Uint8Array')
// decodeExt
  .replace(/latin1Slice\((.+)\)/, 'slice($1)')
;

// index
const removeExportFromIndex = code => code
  .replace(/\s{1,5}static? get (handlers|errors|codecs)[^}]+}/g, '');

module.exports = {
  'index.js': [removeExportFromIndex, ...indexPatch('')['index.js']],
  'Encoder.js': [removeBufferFromEncoder, ...optimize['Encoder.js']],
  'Decoder.js': [removeBufferFromDecoder, ...optimize['Decoder.js']],
  'MsgPackError.js': [...optimize['MsgPackError.js']],
  'Ext.js': [...optimize['Ext.js']],
  ...indexPatch('errors/', 'handlers/', 'encoders/', 'codecs/'),
};

import path from 'path';

const classRequire = code => code
  .replace(/static? get (Ext|Codec|codecs|errors)[^}]+}/g, '')
  .replace(/class [^{]+/g, '')
  .replace(/static? get (.+)\(\)[^}]+}/g, `$1: require('./$1'),`);

const ext = code => code
  .replace(/\s+function required\(.+[^}]+}[^}]+}/, '')
  .replace(/(constructor)[^{]+{/, '$1(type, bin) {');

const removeMsgPackErrorBody = code => code
  .replace(/(class MsgPackError.+)[^}]+}/, '$1');

const patchEncoder = code => code
// Remove Node.js Buffer
  .replace(/[\s]+const (?:alloc|isBuffer) = [^;]+;/g, '')
  .replace(/[\s]+buffer(?:LenMin|AllocMin)=[^,]+,/g, '')
  .replace(/[\s]+this.buffer(?:Alloc|LenMin|AllocMin)? = [^;]+;/g, '')
// Opt. if
  .replace(/\((this.codecs).+\)/g, '($1)')
// ArrayBuffer
  .replace(/\(isBuffer\((.+)\)\)/g, '($1.constructor == ArrayBuffer)')
// encodeStr
  .replace(/if \(len < this.bufferLenMin\)[^}]+} else [^}]+}[^}]+}/,
    'const bin = utf8toBin(str);\r\n    len = bin.length;')
// encodeBin
  .replace(/(str.length), bin/, '$1')
  .replace(/let bin;[\s]+if \(len < 7\)[^{]+{[\s]+([^}]+})[^}]+} else [^}]+}[^}]+}/,
    'let $1\r\n')
// Opt. size
  .replace(/this.codecs/g, 'this.c')
  .replace(/this.unsupportedType/g, 'this.u')
  .replace(/this.encodeObjectKey/g, 'this.e')
  .replace(/this.objectKeys/g, 'this.o');

const patchDecoder = code => code
  .replace(/[\s]?const FastBuffer[^;]+;/, '')
  .replace(/[\s]+bufferLenMin=[^,]+,/, '')
  .replace(/[\s]+this.bufferLenMin = [^;]+;/, '')
// decodeBin
  .replace(/const start[^}]+;/,
    'return this.buffer.slice(this.offset, this.offset += length);')
// decodeStr
  .replace(/\(length < this.bufferLenMin\)[^}]+;/,
    'binToUtf8(this.buffer, this.offset, this.offset += length);')
// decodeExt
  .replace(/latin1Slice\((.+)\)/, 'slice($1)')
// Opt. size
  .replace(/this.unexpectedLength/g, 'this.u')
  .replace(/this.codecs/g, 'this.c')
  .replace(/this.buffer/g, 'this.b')
  .replace(/this.offset/g, 'this.o')
  .replace(/this.length/g, 'this.l');

export default {
  transform(code, id) {
    const { name } = path.parse(id);
    switch (name) {
      case 'index': return classRequire(code);
      case 'Encoder': return patchEncoder(code);
      case 'Decoder': return patchDecoder(code);
      case 'MsgPackError': return removeMsgPackErrorBody(code);
      case 'Ext': return ext(code);
    }

    return code;
  },
};

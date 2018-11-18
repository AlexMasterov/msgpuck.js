import path from 'path';

const removeUint8 = code => code
  .replace(/([\s])+const u8[^;]+;/, '$1')
  .replace(/[\s]+u8,?/, '');

const fromViewToTypedArray = code => code
  .replace(/([,\s])u8(,?)/, '$1f64$2')
  .replace(/const vu8 = [^;]+;/, 'const u8f64 = new Uint8Array(f64.buffer);')
  .replace(/vu8.setFloat(32|64)[^;]+;/g, 'f$1[0] = num;')
  .replace(/([\[(]u8)\[(.+)\]/g, (_, type, idx) => {
    const flipIdx = idx - (idx + 1) & 7;
    return `${type}f64[${flipIdx}]`;
  });

export default {
  transform(code, id) {
    const { name } = path.parse(id);
    switch (name) {
      case 'binary': return removeUint8(code);
      case 'selectEncoderFloat': return fromViewToTypedArray(code);
    }

    return code;
  },
};

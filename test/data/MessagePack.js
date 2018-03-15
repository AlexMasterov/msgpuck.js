const {
  fill: bufferFill,
  createFromString: bufferFromString,
} = process.binding('buffer');
const FastBuffer = Buffer[Symbol.species];

function writeHeader(buf, byte) {
  buf[0] = byte;
  return (size, len, offset = 1) => {
    switch (size) {
      case 1: return 1;
      case 2: return buf.writeUInt8(len, offset);
      case 3: return buf.writeUInt16BE(len, offset);
      case 5: return buf.writeUInt32BE(len, offset);
    }
  };
}

function strHeaders(len) {
  if (len < 0x20) return [len | 0xa0, 1];
  if (len <= 0xff) return [0xd9, 2];
  if (len <= 0xffff) return [0xda, 3];
  return [0xdb, 5];
}

function binHeaders(len) {
  if (len <= 0xff) return [0xc4, 2];
  if (len <= 0xffff) return [0xc5, 3];
  return [0xc6, 5];
}

function arrHeaders(len) {
  if (len <= 0xf) return [0x90 | len, 1];
  if (len <= 0xffff) return [0xdc, 3];
  return [0xdd, 5];
}

function mapHeaders(len) {
  if (len <= 0xf) return [0x80 | len, 1];
  if (len <= 0xffff) return [0xde, 3];
  return [0xdf, 5];
}

function extHeaders(len) {
  switch (len) {
    case 1: return [0xd4, 1];
    case 2: return [0xd5, 1];
    case 4: return [0xd6, 1];
    case 8: return [0xd7, 1];
    case 16: return [0xd8, 1];
  }
  if (len <= 0xff) return [0xc7, 2];
  if (len <= 0xffff) return [0xc8, 3];
  return [0xc9, 5];
}

class MessagePack {
  static str(len, char = 'a') {
    const [byte, size] = strHeaders(len);
    const buf = new FastBuffer(size + len);

    const offset = writeHeader(buf, byte)(size, len);
    bufferFill(buf, char, offset, buf.length, 'utf8');

    return buf.hexSlice(0);
  }

  static bin(len, char = 'a') {
    const [byte, size] = binHeaders(len);
    const buf = new FastBuffer(size + len);

    const offset = writeHeader(buf, byte)(size, len);
    bufferFill(buf, char, offset, buf.length, 'binary');

    return buf.hexSlice(0);
  }

  static arr(len, value = '\x00') {
    const [byte, size] = arrHeaders(len);
    const buf = new FastBuffer(size + len);

    const offset = writeHeader(buf, byte)(size, len);
    bufferFill(buf, value, offset, buf.length, 'binary');

    return buf.hexSlice(0);
  }

  static map(len) {
    let data = '';
    for (let c, i = 0; i < len; i++) {
      c = String(i);
      data += MessagePack.str(c.length, c);
      data += '00';
    }

    const body = bufferFromString(data, 'hex');

    const [byte, size] = mapHeaders(len);
    const head = new FastBuffer(size);
    writeHeader(head, byte)(size, len);

    return head.hexSlice(0) + body.hexSlice(0);
  }

  static ext(type, len) {
    const data = MessagePack.str(len);
    len = Buffer.from(data, 'hex').latin1Slice(0).length - 1;

    const [byte, size] = extHeaders(len);
    const buf = new FastBuffer(size + 1);
    const offset = writeHeader(buf, byte)(size, len);
    buf[offset] = type;

    if (len === 0) return buf.hexSlice(0);


    return buf.hexSlice(0) + data;
  }
}

module.exports = MessagePack;

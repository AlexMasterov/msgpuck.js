'use strict';

const { deepStrictEqual: assertSame, ok: assertTrue, fail } = require('assert');
const {
  Encoder,
  errors: { EncodingFailed },
} = require('../src');
const Data = require('./DataType');

const toHex = (data) => Buffer.from(data, 'binary').hexSlice();

function verify(name, stub, options = {}) {
  it('encode ' + name, () => {
    const encoder = new Encoder(options);
    for (const [expected, type] of stub()) {
      assertSame(toHex(encoder.encode(type)), expected);
    }
  });
}

function verifyThrowEncodingFailed(name, type) {
  it('throws ' + name, () => {
    const encoder = new Encoder();

    try {
      encoder.encode(type);
    } catch (err) {
      assertTrue(err instanceof EncodingFailed);
      assertSame(err.value, type);
      assertSame(err.stack.indexOf('captureStackTrace'), -1);
      return;
    }

    fail('EncodingFailed was not thrown.');
  });
}

describe('Encoder', () => {
  verify('nil', Data.nil);
  verify('bool', Data.bool);
  verify('uint', Data.uint);
  verify('int', Data.int);
  verify('float32', Data.float32, { float32: true });
  verify('float64', Data.float64);
  verify('str', Data.str);
  verify('unicode', Data.unicode);
  verify('bin', Data.bin);
  verify('array', Data.array);
  verify('object as map', Data.object);
  verify('ext', Data.ext);

  it('encode map as map', () => {
    const encoder = new Encoder();
    for (const [expected, type] of Data.map()) {
      assertSame(toHex(encoder.encodeMap(type)), expected);
    }
  });

  function* unsupportedTypes() {
    yield ['function', () => {}];
  }

  for (const data of unsupportedTypes()) {
    verifyThrowEncodingFailed(...data);
  }
});

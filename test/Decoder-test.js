'use strict';

const { deepStrictEqual: assertSame, ok: assertTrue, fail } = require('assert');
const {
  Decoder,
  errors: { DecodingFailed, InsufficientData },
} = require('../src');
const Data = require('./DataType');

const toBin = (data) => Buffer.from(data, 'hex');

function* float32() {
  yield* Data.float32();
  yield ['ca00000000', 0.0];
  // yield ['caffffffff', Number.NaN];
}

function verify(name, stub) {
  it('decode ' + name, () => {
    const decoder = new Decoder();
    for (const [data, expected] of stub()) {
      assertSame(decoder.decode(toBin(data)), expected);
    }
  });
}

function verifyThrowDecodingFailed(byte) {
  it('throws when decode unknown byte', () => {
    const decoder = new Decoder();

    try {
      decoder.decode(byte);
    } catch (e) {
      assertTrue(e instanceof DecodingFailed);
      assertSame(e.value, byte);
      return;
    }

    fail('DecodingFailed was not thrown.');
  });
}

function verifyThrowInsufficientData(name, data, actualLength, expectedLength) {
  it(`it throws when [${name}] data is insufficien`, () => {
    const decoder = new Decoder();
    const bin = toBin(data);

    try {
      decoder.decode(bin);
    } catch (err) {
      assertTrue(err instanceof InsufficientData);
      assertSame(err.value, bin);
      assertSame(
        `Not enough data to decode: expected length ${expectedLength}, got ${actualLength}`,
        err.message
      );
      assertSame(err.stack.indexOf('captureStackTrace'), -1);
      return;
    }

    fail('InsufficientData was not thrown.');
  });
}

describe('Decoder', () => {
  verify('nil', Data.nil);
  verify('bool', Data.bool);
  verify('uint', Data.uint);
  verify('int', Data.int);
  verify('float32', float32);
  verify('float64', Data.float64);
  verify('str', Data.str);
  verify('unicode', Data.unicode);
  verify('bin', Data.bin);
  verify('array', Data.array);
  verify('object', Data.object);
  verify('ext', Data.ext);

  verifyThrowDecodingFailed('\xc1');

  function* insufficientData() {
    yield ['empty', '', 0, 1];
    yield ['str', 'a1', 0, 1];
    yield ['bin8', 'c4', 0, 1];
    yield ['bin8 (data)', 'c420', 0, 32];
    yield ['bin16', 'c5', 0, 2];
    yield ['bin16 (data)', 'c50100', 0, 256];
    yield ['bin32', 'c6', 0, 4];
    yield ['bin32 (data)', 'c600010000', 0, 65536];
    yield ['float32', 'ca', 0, 4];
    yield ['float64', 'cb', 0, 8];
    yield ['uint8', 'cc', 0, 1];
    yield ['uint16', 'cd', 0, 2];
    yield ['uint32', 'ce', 0, 4];
    yield ['uint64', 'cf', 0, 8];
    yield ['int8', 'd0', 0, 1];
    yield ['int16', 'd1', 0, 2];
    yield ['int32', 'd2', 0, 4];
    yield ['int64', 'd3', 0, 8];
    yield ['fixext1', 'd4', 0, 1];
    yield ['fixext4', 'd5', 0, 2];
    yield ['fixext8', 'd6', 0, 4];
    yield ['fixext8', 'd7', 0, 8];
    yield ['fixext16', 'd8', 0, 16];
    yield ['ext8', 'c7', 0, 1];
    yield ['ext16', 'c8', 0, 2];
    yield ['ext32', 'c9', 0, 4];
  }

  for (const data of insufficientData()) {
    verifyThrowInsufficientData(...data);
  }
});

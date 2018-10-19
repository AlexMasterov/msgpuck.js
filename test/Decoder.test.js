'use strict';

const assert = require('assert');
const stub = require('./stub');

const Decoder = require('../src/Decoder');
const DecodingFailed = require('../src/errors/DecodingFailed');
const InsufficientData = require('../src/errors/InsufficientData');

// assets module v8.x can't compare NaN and exceptions
const isNode8 = process.version[1] === '8';
const assertDeepStrictEqualNode8 = (actual, expected) =>
  isNode8 && Number.isNaN(expected)
    ? assert.ok(Number.isNaN(actual))
    : assert.deepStrictEqual(actual, expected);

const testStub = (name, stub) => process =>
  describe(name, () => stub.forEach(({ name, value, bin: buffer }) =>
    it(name, () => process(buffer, value))
  ));

const test = (...stubs) => process =>
  stubs.forEach(type => testStub(type, stub[type])(process));

const testUnexpectedLength = (...stubs) => process =>
  stubs.forEach(([type, slice]) =>
    describe(type, () => stub[type].forEach(({ name, bin: buffer }) =>
      it(name, () => process(buffer.slice(0, slice)))
    )));

describe('Decoder', () => {
  test('nil')((buffer, expected) => {
    const decoder = new Decoder();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test('boolean')((buffer, expected) => {
    const decoder = new Decoder();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test('float')((buffer, expected) => {
    const decoder = new Decoder();
    assertDeepStrictEqualNode8(decoder.decode(buffer), expected);
  });

  test('float32')((buffer, expected) => {
    const decoder = new Decoder();
    assertDeepStrictEqualNode8(decoder.decode(buffer), expected);
  });

  test('float64')((buffer, expected) => {
    const decoder = new Decoder();
    assertDeepStrictEqualNode8(decoder.decode(buffer), expected);
  });

  test(
    'fixint',
    'uint8',
    'uint16',
    'uint32',
    (global.BigInt ? 'bigint' : 'uint64'),
    '-fixint',
    'int8',
    'int16',
    'int32',
    (global.BigInt ? 'bigint' : 'int64'),
  )((buffer, expected) => {
    const decoder = new Decoder();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'fixstr',
    'str8',
    'str16',
    'str32',
    'utf8',
  )((buffer, expected) => {
    const decoder = new Decoder({ bufferMinLen: 6 });
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'bin8',
    'bin16',
    'bin32',
  )((buffer, expected) => {
    const decoder = new Decoder();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'fixarr',
    'arr16',
    'arr32',
  )((buffer, expected) => {
    const decoder = new Decoder();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'fixobj',
    'obj16',
    'obj32',
  )((buffer, expected) => {
    const decoder = new Decoder();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'fixext',
    'ext8',
    'ext16',
    'ext32',
  )((buffer, expected) => {
    const decoder = new Decoder();
    assert.deepStrictEqual(decoder.decode(buffer), expected);
  });

  describe('throws', () => {
    it('no data', () => {
      const decoder = new Decoder();
      const buffer = Buffer.allocUnsafe(0);
      assert.throws(() => decoder.decode(buffer), DecodingFailed);
    });

    it('decode unknown byte (0xc1)', () => {
      const decoder = new Decoder();
      const buffer = Buffer.from([0xc1]);
      assert.throws(() => decoder.decode(buffer), DecodingFailed);
    });

    testUnexpectedLength(
      ['float32', 1],
      ['float64', 1],
      ['int8', 1],
      ['int16', 1],
      ['int32', 1],
      ['int64', 1],
      ['uint8', 1],
      ['uint16', 1],
      ['uint32', 1],
      ['uint64', 1],
      ['str8', 1],
      ['str16', 3],
      ['str32', 5],
      ['bin8', 1],
      ['bin16', 3],
      ['arr16', 2],
      ['arr32', 4],
      ['obj16', 2],
      ['obj32', 4],
      ['fixext', 1],
      ['ext8', 3],
      ['ext16', 4],
      ['ext32', 6],
    )(buffer => {
      const decoder = new Decoder();
      assert.throws(() => decoder.decode(buffer), InsufficientData);
    });
  });
});

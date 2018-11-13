'use strict';

const { deepStrictEqual, ok, throws } = require('assert');
// assets module v8.x can't compare NaN and exceptions
const isNodeX = process.version[2] === '.';
const assertFloatEqual = (actual, expected) =>
  isNodeX && Number.isNaN(expected)
    ? ok(Number.isNaN(actual))
    : deepStrictEqual(actual, expected);

const stub = require('./stub');

const { Decoder, errors } = require('../');
const { DecodingFailed, InsufficientData } = errors;

const test = (...stubs) => spec => stubs.forEach(name =>
  describe(name, () => stub[name].forEach(({ name, value, bin }) =>
    it(name, () => spec(bin, value))
  )));

const testUnexpectedLength = (...stubs) => spec =>
  stubs.forEach(([type, slice]) =>
    describe(type, () => stub[type].forEach(({ name, bin }) =>
      it(name, () => spec(bin.slice(0, slice)))
    )));

describe('Decoder', () => {
  test('nil')((buffer, expected) => {
    const decoder = new Decoder();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test('boolean')((buffer, expected) => {
    const decoder = new Decoder();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test('float')((buffer, expected) => {
    const decoder = new Decoder();
    assertFloatEqual(decoder.decode(buffer), expected);
  });

  test('float32')((buffer, expected) => {
    const decoder = new Decoder();
    const actual = decoder.decode(buffer);
    assertFloatEqual(decoder.decode(buffer), expected);
  });

  test('float64')((buffer, expected) => {
    const decoder = new Decoder();
    assertFloatEqual(decoder.decode(buffer), expected);
  });

  test(
    '+fixint',
    'uint8',
    'uint16',
    'uint32',
    (global.BigInt ? 'uint64' : 'uint64_safe'),
    '-fixint',
    'int8',
    'int16',
    'int32',
    (global.BigInt ? 'int64' : 'int64_safe')
  )((buffer, expected) => {
    const decoder = new Decoder();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'fixstr',
    'str8',
    'str16',
    'str32',
    'utf8'
  )((buffer, expected) => {
    const decoder = new Decoder({ bufferMinLen: 6 });
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'bin8',
    'bin16',
    'bin32'
  )((buffer, expected) => {
    const decoder = new Decoder();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'fixarr',
    'arr16',
    'arr32'
  )((buffer, expected) => {
    const decoder = new Decoder();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'fixobj',
    'obj16',
    'obj32'
  )((buffer, expected) => {
    const decoder = new Decoder();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  test(
    'fixext',
    'ext8',
    'ext16',
    'ext32'
  )((buffer, expected) => {
    const decoder = new Decoder();
    deepStrictEqual(decoder.decode(buffer), expected);
  });

  describe('throws', () => {
    it('no data', () => {
      const decoder = new Decoder();
      const buffer = Buffer.allocUnsafe(0);
      throws(() => decoder.decode(buffer), DecodingFailed);
    });

    it('decode unknown byte (0xc1)', () => {
      const decoder = new Decoder();
      const buffer = Buffer.from([0xc1]);
      throws(() => decoder.decode(buffer), DecodingFailed);
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
      ['ext32', 6]
    )(bin => {
      const decoder = new Decoder();
      throws(() => decoder.decode(bin), InsufficientData);
    });
  });
});

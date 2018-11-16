'use strict';

const { deepStrictEqual, throws } = require('assert');
const stub = require('./stub');

const { Encoder, errors } = require('../');
const { EncodingFailed } = errors;

const test = (...stubs) => spec => stubs.forEach(name =>
  describe(name, () => stub[name].forEach(({ name, value, bin }) =>
    it(name, () => spec(value, bin.latin1Slice()))
  )));

describe('Encoder', () => {
  test('nil')((value, expected) => {
    const encoder = new Encoder();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeNil(), expected);
  });

  test('boolean')((value, expected) => {
    const encoder = new Encoder();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeBool(value), expected);
  });

  test('float')((value, expected) => {
    const encoder = new Encoder({ float: 'auto' });
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeFloat(value), expected);
  });

  test('float32')((value, expected) => {
    const encoder = new Encoder({ float: '32' });
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeFloat(value), expected);
  });

  test('float64')((value, expected) => {
    const encoder = new Encoder({ float: '64' });
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeFloat(value), expected);
  });

  const integers = [
    '+fixint',
    'uint8',
    'uint16',
    'uint32',
    'uint64_safe',
    '-fixint',
    'int8',
    'int16',
    'int32',
    'int64_safe',
  ];

  test(
    ...integers,
    'uint64_safe_overflow',
    'int64_safe_overflow'
  )((value, expected) => {
    const encoder = new Encoder();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeInt(value), expected);
  });

  global.BigInt &&
    test(
      ...integers,
      'uint64',
      'int64'
    )((value, expected) => {
      const encoder = new Encoder();
      deepStrictEqual(encoder.encode(BigInt(value)), expected);
    });

  test(
    'fixstr',
    'str8',
    'str16',
    'str32',
    'utf8'
  )((value, expected) => {
    const encoder = new Encoder({ bufferMinLen: 10 });
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeStr(value), expected);
  });

  test(
    'bin8',
    'bin16',
    'bin32'
  )((value, expected) => {
    const encoder = new Encoder();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeBin(value), expected);
  });

  test(
    'fixarr',
    'arr16',
    'arr32'
  )((value, expected) => {
    const encoder = new Encoder();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeArray(value), expected);
  });

  test(
    'fixobj',
    'obj16',
    'obj32'
  )((value, expected) => {
    const encoder = new Encoder();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeObject(value), expected);
  });

  test(
    'fixext',
    'ext8',
    'ext16',
    'ext32'
  )((value, expected) => {
    const encoder = new Encoder();
    deepStrictEqual(encoder.encode(value), expected);
    deepStrictEqual(encoder.encodeExt(value.type, value.bin), expected);
  });

  describe('throws', () => {
    [
      () => {},
      undefined,
      Symbol('xyz')
    ].forEach(type =>
      it(`Could not encode: ${typeof type}`, () =>
        throws(() => (new Encoder).encode(type), EncodingFailed)
      ));
  });
});

'use strict';

const assert = require('assert');
const stub = require('./stub');

const Encoder = require('../src/Encoder');
const EncodingFailed = require('../src/errors/EncodingFailed');

const testStub = (name, stub) => process =>
  describe(name, () => stub.forEach(({ name, value, bin }) =>
    it(name, () => process(value, bin.latin1Slice()))
  ));

const test = (...stubs) => process =>
  stubs.forEach(type => testStub(type, stub[type])(process));

const testThrows = name => process =>
  describe('throws', () =>
    it(name, () => process())
  );

describe('Encoder', () => {
  test('nil')((value, expected) => {
    const encoder = new Encoder();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeNil(), expected);
  });

  test('boolean')((value, expected) => {
    const encoder = new Encoder();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeBool(value), expected);
  });

  test('float32')((value, expected) => {
    const encoder = new Encoder({ float32: true });
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeFloat32(value), expected);
  });

  test('float64')((value, expected) => {
    const encoder = new Encoder();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeFloat64(value), expected);
  });

  test(
    'fixint',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    '-fixint',
    'int8',
    'int16',
    'int32',
    'int64',
  )((value, expected) => {
    const encoder = new Encoder();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeInt(value), expected);
  });

  test(
    'fixstr',
    'str8',
    'str16',
    'str32',
    'utf8',
  )((value, expected) => {
    const encoder = new Encoder({ bufferMinLen: 10 });
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeStr(value), expected);
  });

  test(
    'bin8',
    'bin16',
    'bin32',
  )((value, expected) => {
    const encoder = new Encoder();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeBin(value), expected);
  });

  test(
    'fixarr',
    'arr16',
    'arr32',
  )((value, expected) => {
    const encoder = new Encoder();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeArray(value), expected);
  });

  test(
    'fixobj',
    'obj16',
    'obj32',
  )((value, expected) => {
    const encoder = new Encoder();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeObject(value), expected);
  });

  test(
    'fixmap',
    'map16',
    'map32',
  )((value, expected) => {
    const encoder = new Encoder();
    assert.deepStrictEqual(encoder.encodeMap(value), expected);
  });

  test(
    'fixext',
    'ext8',
    'ext16',
    'ext32',
  )((value, expected) => {
    const encoder = new Encoder();
    assert.deepStrictEqual(encoder.encode(value), expected);
    assert.deepStrictEqual(encoder.encodeExt(value.type, value.data), expected);
  });

  [
    () => {},
  ].forEach(type => {
    const process = () => {
      const encoder = new Encoder();
      assert.throws(() => encoder.encode(type), EncodingFailed);
    };

    testThrows(`${typeof type} '${type}' could not encode`)(process);
  });
});

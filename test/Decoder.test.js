'use strict';

const { deepStrictEqual, ok } = require('assert');
const stub = require('./stub');

// assets module v8.x can't compare NaN and exceptions
const isNodeX = process.version[2] === '.';
const assertFloatEqual = (actual, expected) =>
  isNodeX && Number.isNaN(expected)
    ? ok(Number.isNaN(actual))
    : deepStrictEqual(actual, expected);

const { Decoder } = require('../');

const test = (...stubs) => spec => stubs.forEach(name =>
  describe(name, () => stub[name].forEach(({ name, value, bin }) =>
    it(name, () => spec(bin, value))
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
    'uint64_safe_overflow',
    'int64_safe_overflow'
  )((buffer, expected) => {
    const decoder = new Decoder();
    const actual = decoder.decode(buffer);
    deepStrictEqual(Number.isFinite(actual), false);
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
});

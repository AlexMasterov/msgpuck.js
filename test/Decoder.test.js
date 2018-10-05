'use strict';

const assert = require('assert');
const { Decoder, errors: { DecodingFailed, InsufficientData } } = require('../src');

const types = require('./stub/types');

// assets module v8.x can't compare NaN and exceptions
const isNode8 = process.version[1] === '8';

function testDecode(type) {
  type.forEach(({ name, value: expected, bin }) => {
    const decoder = new Decoder();
    it(name, () => {
      const buffer = Buffer.from(bin);
      const actual = decoder.decode(buffer);

      assert.deepStrictEqual(actual, expected);
    });
  });
}

function testThrowsNoData(buffer) {
  it(`throws when no data`, () => {
    const decoder = new Decoder();
    assert.throws(() => decoder.decode(buffer), {
      name: 'DecodingFailed',
      message: 'No data to decode',
    });
  });
}

function testThrowsDecodingFailed(byte) {
  it(`throws when decode unknown byte (${byte})`, () => {
    const decoder = new Decoder();
    assert.throws(() => decoder.decode(byte), {
      name: 'DecodingFailed',
    });
  });
}

function testThrowsInsufficientData(name, buffer, actualLength, expectedLength) {
  it(`throws when ${name} data is insufficien`, () => {
    const decoder = new Decoder();
    assert.throws(() => decoder.decode(buffer), {
      name: 'InsufficientData',
      message: `Not enough data to decode: expected length ${expectedLength}, got ${actualLength}`,
    });
  });
}

describe('Decoder', () => {
  if (isNode8) {
    const excludeNaN = type => type.name !== 'NaN';
    types.float32 = types.float32.filter(excludeNaN);
    types.float64 = types.float64.filter(excludeNaN);
  }

  const excludeOverflow = type => !type.name.includes('overflow');
  types.uint64 = types.uint64.filter(excludeOverflow);
  types.int64 = types.int64.filter(excludeOverflow);

  const skip = [
    'bigint64',
    'fixmap',
    'map16',
    'map32',
  ];

  const tests = Object.entries(types)
    .filter(([name]) => skip.indexOf(name) === -1);

  for (const [name, type] of tests) {
    describe(name, () => testDecode(type));
  }

  if (isNode8) return;

  const bytes = (...bytes) => Buffer.from(bytes);

  testThrowsNoData(bytes());
  testThrowsDecodingFailed('\xc1');
  testThrowsInsufficientData('float32', bytes(0xca), 0, 4);
  testThrowsInsufficientData('float64', bytes(0xcb), 0, 8);
  testThrowsInsufficientData('int8', bytes(0xd0), 0, 1);
  testThrowsInsufficientData('int16', bytes(0xd1), 0, 2);
  testThrowsInsufficientData('int32', bytes(0xd2), 0, 4);
  testThrowsInsufficientData('int64', bytes(0xd3), 0, 8);
  testThrowsInsufficientData('uint8', bytes(0xcc), 0, 1);
  testThrowsInsufficientData('uint16', bytes(0xcd), 0, 2);
  testThrowsInsufficientData('uint32', bytes(0xce), 0, 4);
  testThrowsInsufficientData('uint64', bytes(0xcf), 0, 8);
  testThrowsInsufficientData('str', bytes(0xa1), 0, 1);
  testThrowsInsufficientData('bin8', bytes(0xc4), 0, 1);
  testThrowsInsufficientData('bin16', bytes(0xc5), 0, 2);
  testThrowsInsufficientData('bin32', bytes(0xc6), 0, 4);
  testThrowsInsufficientData('bin8 (data)', bytes(0xc4, 0x20), 0, 32);
  testThrowsInsufficientData('bin16 (data)', bytes(0xc5, 0x01, 0x00), 0, 256);
  testThrowsInsufficientData('bin32 (data)', bytes(0xc6, 0x00, 0x01, 0x00, 0x00), 0, 65536);
  testThrowsInsufficientData('fixext1', bytes(0xd4), 0, 1);
  testThrowsInsufficientData('fixext2', bytes(0xd5), 0, 2);
  testThrowsInsufficientData('fixext4', bytes(0xd6), 0, 4);
  testThrowsInsufficientData('fixext8', bytes(0xd7), 0, 8);
  testThrowsInsufficientData('fixext16', bytes(0xd8), 0, 16);
});

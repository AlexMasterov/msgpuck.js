'use strict';

const assert = require('assert');
const { Decoder, errors: { DecodingFailed } } = require('../src');
const types = require('./stub/types');

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

function testThrowsDecodingFailed(byte) {
  it(`throws when decode unknown byte (${byte})`, () => {
    const decoder = new Decoder();
    assert.throws(() => { decoder.decode(byte); }, DecodingFailed);
  });
}

describe('Decoder', () => {
  const skip = [
    'uint Infinity cb',
    'int NaN cb',
    'bigint64 cf',
    'fixmap 80-8f (Map)',
    'map16 de (Map)',
    'map32 df (Map)',
  ];

  const tests = Object.entries(types)
    .filter(([name]) => skip.indexOf(name) === -1);

  for (const [name, type] of tests) {
    describe(name, () => testDecode(type));
  }

  testThrowsDecodingFailed('\xc1');
});

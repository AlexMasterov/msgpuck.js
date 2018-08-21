'use strict';

const assert = require('assert');
const { Encoder, errors: { EncodingFailed } } = require('../src');
const types = require('./stub/types');

function testEncode(type, options) {
  const encoder = new Encoder(options);

  type.forEach(({ name, value, bin }) => {
    it(name, () => {
      const actual = encoder.encode(value);
      const expected = Buffer.from(bin).latin1Slice();

      assert.deepStrictEqual(actual, expected);
    });
  });
}

function testThrowEncodingFailed(value) {
  it(`throws when '${value}' could not encode`, () => {
    const encoder = new Encoder();
    assert.throws(() => { encoder.encode(value); }, EncodingFailed);
  });
}

describe('Encoder', () => {
  const skip = [
    'bigint64 cf',
  ];

  const tests = Object.entries(types)
    .filter(([name]) => skip.indexOf(name) === -1);

  for (const [name, type] of tests) {
    let options = {};
    if (name === 'float32 ca') options = { float32: true };
    describe(name, () => testEncode(type, options));
  }

  testThrowEncodingFailed(() => {});
});

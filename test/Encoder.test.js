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

function testEncodeMethod(method, type) {
  const encoder = new Encoder();
  type.forEach(({ value, bin }) => {
    it(`encoder.${method}`, () => {
      const actual = encoder[method](value);
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
  const tests = Object.entries(types);

  const skip = [
    'bigint64 cf',
    'fixmap 80-8f (Map)',
    'map16 de (Map)',
    'map32 df (Map)',
  ];

  const toEncode = tests
    .filter(([name]) => skip.indexOf(name) === -1);

  for (const [name, type] of toEncode) {
    let options = {};
    if (name === 'float32 ca') options = { float32: true };
    describe(name, () => testEncode(type, options));
  }

  const methods = new Map([
    ['null c0', 'encodeNil'],
    ['boolean c2/c3', 'encodeBool'],
    ['fixmap 80-8f (Map)', 'encodeMap'],
    ['map16 de (Map)', 'encodeMap'],
    ['map32 df (Map)', 'encodeMap'],
  ]);

  describe('low level API', () => {
    for (const [name, type] of tests) {
      if (methods.has(name)) {
        describe(name, () => testEncodeMethod(methods.get(name), type));
      }
    }
  });

  testThrowEncodingFailed(() => {});
});

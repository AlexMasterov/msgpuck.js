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

describe('Encoder', () => {
  const encoder = new Encoder();

  const unsupportedTypes = [
    () => {},
  ];

  unsupportedTypes.forEach(type => {
    it(`throws when ${typeof type} '${type}' could not encode`, () => {
      assert.throws(() => encoder.encode(type), EncodingFailed );
    });
  });

  const tests = Object.entries(types);

  const skip = [
    'bigint64',
    'fixmap map',
    'map16 map',
    'map32 map',
  ];

  const toEncode = tests
    .filter(([name]) => skip.indexOf(name) === -1);

  for (const [name, type] of toEncode) {
    let options = {};
    if (name === 'float32') options = { float32: true };
    describe(name, () => testEncode(type, options));
  }

  const methods = new Map([
    ['null', 'encodeNil'],
    ['boolean', 'encodeBool'],
    ['fixmap map', 'encodeMap'],
    ['map16 map', 'encodeMap'],
    ['map32 map', 'encodeMap'],
  ]);

  describe('low level API', () => {
    for (const [name, type] of tests) {
      if (methods.has(name)) {
        describe(name, () => testEncodeMethod(methods.get(name), type));
      }
    }
  });
});

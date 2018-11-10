'use strict';

const assert = require('assert');
const { Encoder, Decoder, Codec } = require('../src');

const {
  MapCodec,
  ScalarObjectCodec,
} = require('../src/codecs');

const test = (...stubs) => process =>
  stubs.forEach(({ name, value, expected }) =>
    it(name, () => process(value, expected)));

const type = (name, value, expected) => ({ name, value, expected });

function process(value, ...codecs) {
  const options = { codecs };
  const encoder = new Encoder(options);
  const decoder = new Decoder(options);

  const encoded = encoder.encode(value);
  const buffer = Buffer.from(encoded, 'binary');

  return decoder.decode(buffer);
}

describe('Codecs', () => {
  describe('[Abstract] Codec', () => {
    it(`Default codec type (${Codec.type})`, () => {
      const actual = class extends Codec {};
      assert.deepStrictEqual(actual.type, Codec.type);
    });
  });

  describe('ScalarObjectCodec', () => {
    test(
      type('Number', Number(42), 42),
      type('String', String('xyz'), 'xyz'),
      type('Boolean (true)', Boolean(true), true),
      type('Boolean (false)', Boolean(false), false),
    )((value, expected) => {
      const actual = process(value, new ScalarObjectCodec());
      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('MapCodec', () => {
    test(
      type('Map', new Map([['xyz', 42]]), new Map([['xyz', 42]])),
    )((value, expected) => {
      const actual = process(value, new MapCodec());
      assert.deepStrictEqual(actual, expected);
    });
  });
});

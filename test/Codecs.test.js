'use strict';

const { deepStrictEqual } = require('assert');

const { Encoder, Decoder, Codec, codecs } = require('../');
const { MapCodec, ScalarObjectCodec } = codecs;

const test = (...stubs) => spec =>
  stubs.forEach(({ name, value, expected }) =>
    it(name, () => spec(value, expected)));

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
      const UselessCodec = class extends Codec {
        encode(encoder, value) { return null; }
      };

      const uselessCodec = new UselessCodec(42);
      deepStrictEqual(UselessCodec.type, Codec.type);
      deepStrictEqual(uselessCodec.type, 42);

      const actual = process({}, uselessCodec);
      deepStrictEqual(actual, {});
    });
  });

  describe('ScalarObjectCodec', () => {
    test(
      type('Number', new Number(42), 42),
      type('String', new String('xyz'), 'xyz'),
      type('Boolean (true)', new Boolean(true), true),
      type('Boolean (false)', new Boolean(false), false),
      type('default', { default: true }, { default: true })
    )((value, expected) => {
      const actual = process(value, new ScalarObjectCodec());
      deepStrictEqual(actual, expected);
    });
  });

  describe('MapCodec', () => {
    test(
      type('Map', new Map([['xyz', 42]]), new Map([['xyz', 42]]))
    )((value, expected) => {
      const actual = process(value, new MapCodec());
      deepStrictEqual(actual, expected);
    });
  });
});

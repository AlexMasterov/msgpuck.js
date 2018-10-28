'use strict';

const assert = require('assert');
const { Encoder, Decoder } = require('../src');
const Codec = require('../src/Codec');

const {
  BooleanCodec,
  ErrorCodec,
  MapCodec,
  NumberCodec,
  RegExpCodec,
  SetCodec,
  StringCodec,
  SymbolCodec,
  UndefinedCodec,
} = require('../src/codecs');

function process(value, codec) {
  const options = { codecs: [codec] };
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

  describe('undefined', () => {
    it('UndefinedCodec', () => {
      const value = undefined;
      const actual = process(value, UndefinedCodec.make());
      assert.deepStrictEqual(actual, value);
    });
  });

  describe('Symbol', () => {
    it('SymbolCodec', () => {
      const value = Symbol('xyz');
      const actual = process(value, SymbolCodec.make());
      assert.deepStrictEqual(actual.toString(), value.toString());
    });

    it('SymbolCodec for', () => {
      const value = Symbol('xyz');
      const actual = process(value, SymbolCodec.withFor());
      assert.deepStrictEqual(actual.toString(), value.toString());
    });
  });

  describe('String', () => {
    it('StringCodec', () => {
      const value = new String('xyz');
      const actual = process(value, StringCodec.make());
      assert.deepStrictEqual(actual, value.toString());
    });
  });

  describe('Number', () => {
    it('NumberCodec', () => {
      const value = new Number(42);
      const actual = process(value, NumberCodec.make());
      assert.deepStrictEqual(actual, value.valueOf());
    });
  });

  describe('Boolean', () => {
    it('BooleanCodec true', () => {
      const value = new Boolean(true);
      const actual = process(value, BooleanCodec.make());
      assert.deepStrictEqual(actual, value.valueOf());
    });

    it('BooleanCodec false', () => {
      const value = new Boolean(false);
      const actual = process(value, BooleanCodec.make());
      assert.deepStrictEqual(actual, value.valueOf());
    });
  });

  describe('RegExp', () => {
    it('RegExpCodec', () => {
      const value = /xyz/;
      const actual = process(value, RegExpCodec.make());
      assert.deepStrictEqual(actual, new RegExp(value));
    });

    it('RegExpCodec /i', () => {
      const value = /xyz/i;
      const actual = process(value, RegExpCodec.make());
      assert.deepStrictEqual(actual, new RegExp(value));
    });
  });

  describe('Error', () => {
    it('ErrorCodec', () => {
      const value = new Error('xyz', 'Error');
      const actual = process(value, ErrorCodec.make());
      assert.deepStrictEqual(actual, value);
    });
  });

  describe('Set', () => {
    it('SetCodec', () => {
      const value = new Set([['xyz', 42]]);
      const actual = process(value, SetCodec.make());
      assert.deepStrictEqual(actual, value);
    });
  });

  describe('Map', () => {
    it('MapCodec', () => {
      const value = new Map([['xyz', 42]]);
      const actual = process(value, MapCodec.make());
      assert.deepStrictEqual(actual, value);
    });
  });
});

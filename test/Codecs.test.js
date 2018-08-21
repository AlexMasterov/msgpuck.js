'use strict';

const assert = require('assert');
const { Encoder, Decoder } = require('../src');
const codecs = require('./stub/codecs');

function test(type) {
  type.forEach(({ name, codec, encode, decode: expected }) => {
    const options = { codecs: [codec] };
    const encoder = new Encoder(options);
    const decoder = new Decoder(options);

    it(name, () => {
      const encoded = encoder.encode(encode);
      let decoded = decoder.decode(Buffer.from(encoded, 'binary'));

      if (typeof expected === 'symbol') {
        decoded = decoded.toString();
        expected = expected.toString();
      }

      assert.deepStrictEqual(decoded, expected);
    });
  });
}

describe('Codecs', () => {
  const tests = Object.entries(codecs);
  for (const [name, type] of tests) {
    describe(name, () => test(type));
  }
});

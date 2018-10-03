'use strict';

const assert = require('assert');
const Encoder = require('../src/Encoder');
const Decoder = require('../src/Decoder');

const codecs = Object.entries(require('./stub/codecs'));

describe('Codecs', () => {
  codecs.forEach(([typeName, tests]) => {
    describe(typeName, () => tests.forEach(({ name, codec, encode, decode }) => {
      const options = { codecs: [codec] };
      const encoder = new Encoder(options);
      const decoder = new Decoder(options);

      it(name, () => {
        const encoded = encoder.encode(encode);
        let actual = decoder.decode(Buffer.from(encoded, 'binary'));

        if (typeof decode === 'symbol') {
          actual = actual.toString();
          decode = decode.toString();
        }

        assert.deepStrictEqual(actual, decode);
      });
    }));
  });
});

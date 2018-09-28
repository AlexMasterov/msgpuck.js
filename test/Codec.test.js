'use strict';

const assert = require('assert');
const Codec = require('../src/Codec');

describe('Codec', () => {
  const codec = Codec.make();
  const implRequiredMethods = [
    'supports',
    'encode',
    'decode',
  ];

  implRequiredMethods.forEach(method => {
    it(`throws when '${method}' method is not implemented`, () => {
      assert.throws(() => codec[method](), Error);
    });
  });
});

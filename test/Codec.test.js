'use strict';

const assert = require('assert');
const Codec = require('../src/Codec');

function testThrowsMethod(method) {
  it(`throws when '${method}' method is not implemented`, () => {
    assert.throws(() => { Codec.make()[method]('not implemented'); }, Error);
  });
}

describe('Codec', () => {
  testThrowsMethod('supports');
  testThrowsMethod('encode');
  testThrowsMethod('decode');
});

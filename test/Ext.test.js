'use strict';

const assert = require('assert');
const Ext = require('../src/Ext');

describe('Ext', () => {
  const requireParams = 2;
  const missingParams = [
    [],
    [1],
  ];

  missingParams.forEach(params => {
    const count = requireParams - params.length;
    it(`throws when ${count} parameters is missing`, () =>
      assert.throws(() => Ext.make(...params), Error));
  });
});

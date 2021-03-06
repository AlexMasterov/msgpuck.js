'use strict';

const { throws } = require('assert');
const { Ext } = require('../');

describe('Ext', () => {
  const requireParams = 2;
  const missingParams = [
    [],
    [1],
  ];

  missingParams.forEach(params => {
    const count = requireParams - params.length;
    it(`throws when ${count} parameters is missing`, () =>
      throws(() => new Ext(...params), Error));
  });
});

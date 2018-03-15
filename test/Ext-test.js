'use strict';

const { deepStrictEqual: assertSame, throws } = require('assert');
const { Ext } = require('../src');

describe('Ext', () => {
  it('throws when parameters is missing', () => {
    throws(() => { Ext.make(); }, Error);
    throws(() => { Ext.make(1); }, Error);
  });
});

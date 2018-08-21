'use strict';

const assert = require('assert');
const Ext = require('../src/Ext');

describe('Ext', () => {
  it('throws when parameters is missing', () => {
    assert.throws(() => { Ext.make(); }, Error);
    assert.throws(() => { Ext.make(1); }, Error);
  });
});

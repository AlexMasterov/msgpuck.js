'use strict';

const { deepStrictEqual: assertSame } = require('assert');
const { CHR } = require('../src/utf8');

describe('ASCII', () => {
  let ascii = '';
  before(() => {
    for (let i = 0; i <= 256; i++) ascii += String.fromCharCode(i);
  });

  it('valid length', () => {
    assertSame(CHR.length, ascii.length);
  });

  it('valid character codes', () => {
    let i = 256;
    while (i--) assertSame(CHR[i], ascii[i]);
  });
});

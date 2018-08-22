'use strict';

const assert = require('assert');
const { CHR } = require('../src/utf8');

function genASCII() {
  let table = '';
  for (let i = 0; i <= 256; i++) table += String.fromCharCode(i);
  return table;
}

describe('CHR ASCII', () => {
  const ascii = genASCII();

  it('valid length', () => {
    assert.deepStrictEqual(CHR.length, ascii.length);
  });

  it('valid character codes', () => {
    let i = 256;
    while (i--) assert.deepStrictEqual(CHR[i], ascii[i]);
  });
});

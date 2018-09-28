'use strict';

const assert = require('assert');
const { CHR } = require('../src/optimizers');

const TABLE_LENGTH = 256;

function genAsciiTable() {
  const table = new Array(TABLE_LENGTH);
  let i = TABLE_LENGTH + 1; // reverse 0
  while (i--) table[i] = String.fromCharCode(i);
  return table;
}

describe('ASCII', () => {
  const ascii = genAsciiTable();

  it(`CHR table has valid length (${ascii.length})`, () => {
    assert.deepStrictEqual(CHR.length, ascii.length);
  });

  it('CHR table has valid character codes', () => {
    let i = TABLE_LENGTH;
    while (i--) assert.deepStrictEqual(CHR[i], ascii[i]);
  });
});

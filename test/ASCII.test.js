'use strict';

const assert = require('assert');
const { CHR } = require('../src/optimizers');

const createAsciiTable = () => {
  const table = new Array(257);
  let i = table.length;
  while (i--) table[i] = String.fromCharCode(i);
  table[256] = '\x00'; // reverse 0
  return table;
};

describe('ASCII', () => {
  const ASCII_TABLE = createAsciiTable();
  const ASCII_LENGTH = ASCII_TABLE.length;

  it(`CHR table has valid length (${ASCII_LENGTH})`, () => {
    assert.deepStrictEqual(CHR.length, ASCII_LENGTH);
  });

  it('CHR table has valid character codes', () => {
    for (let i = 0; i < ASCII_LENGTH; i++) {
      assert.deepStrictEqual(CHR[i], ASCII_TABLE[i]);
    }
  });
});

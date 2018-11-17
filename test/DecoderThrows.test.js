'use strict';

const { throws } = require('assert');
const stub = require('./stub');

const { Decoder, errors } = require('../');
const { DecodingFailed, InsufficientData, MsgPackError } = errors;

const type = (name, length) => [name, length];
const testUnexpectedLength = (...stubs) => spec =>
  stubs.forEach(([name, length]) =>
    it(`${name} (${length})`, () => stub[name].forEach(({ bin }) =>
      spec(bin.slice(0, length), length))
    ));

const hasErrors = (...errors) => throwsError =>
  errors.every(error => throwsError instanceof error);

describe('Decoder throws', () => {
  it('No data', () => {
    const decoder = new Decoder();
    const buffer = Buffer.allocUnsafe(0);
    throws(() => decoder.decode(buffer),
      hasErrors(DecodingFailed, MsgPackError));
  });

  it('Decode unknown byte (0xc1)', () => {
    const decoder = new Decoder();
    const buffer = Buffer.from([0xc1]);
    throws(() => decoder.decode(buffer),
      hasErrors(DecodingFailed, MsgPackError));
  });

  describe('Not enough data to decode', () => {
    testUnexpectedLength(
      // float
      type('float32', 1),
      type('float64', 1),
      // uint
      type('uint8', 1),
      type('uint16', 1),
      type('uint32', 1),
      type('uint64', 1),
      // int
      type('int8', 1),
      type('int16', 1),
      type('int32', 1),
      type('int64', 1),
      // str
      type('str8', 1),
      type('str16', 3),
      type('str32', 5),
      // bin
      type('bin8', 1),
      type('bin16', 3),
      // arr
      type('arr16', 2),
      type('arr32', 4),
      // obj
      type('obj16', 2),
      type('obj32', 4),
      // ext
      type('fixext', 1),
      type('ext8', 3),
      type('ext16', 4),
      type('ext32', 6),
    )(buffer => {
      const decoder = new Decoder();
      throws(() => decoder.decode(buffer),
        hasErrors(DecodingFailed, MsgPackError));
    });
  });
});

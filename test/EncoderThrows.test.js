'use strict';

const { throws } = require('assert');

const { Encoder, errors } = require('../');
const { EncodingFailed, MsgPackError } = errors;

const test = (...values) => spec =>
  values.forEach(value =>
    it(typeof value, () => spec(value)));

const hasErrors = (...errors) => throwsError =>
  errors.every(error => throwsError instanceof error);

describe('Encoder throws', () => {
  describe('Could not encode', () => {
    test(
      () => {},
      undefined,
      Symbol('xyz')
    )(value => {
      const encoder = new Encoder();
      throws(() => encoder.encode(value),
        hasErrors(EncodingFailed, MsgPackError));
    });
  });
});

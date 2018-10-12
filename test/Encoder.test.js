'use strict';

const assert = require('assert');
const Encoder = require('../src/Encoder');
const EncodingFailed = require('../src/errors/EncodingFailed');

const stubs = Object.entries(require('./stub'));
const stub = (...types) => stubs.filter(([name]) => types.indexOf(name) !== -1);

const test = (stubs, handle) => stubs.forEach(([typeName, tests]) => {
  describe(typeName, () => tests.forEach(({ name, value, bin }) => {
    it(name, () => assert.deepStrictEqual(handle(value), bin.latin1Slice()));
  }));
});

describe('Encoder', () => {
  const encoder = new Encoder();

  const exclude = ['bigint64', 'float32', 'fixmap', 'map16', 'map32'];
  const encodeStub = stubs.filter(([name]) => exclude.indexOf(name) === -1);

  test(encodeStub, encoder.encode.bind(encoder));

  describe('low level API', () => {
    test(stub('nil'), encoder.encodeNil.bind(encoder));
    test(stub('boolean'), encoder.encodeBool.bind(encoder));
    test(stub('float32'), encoder.encodeFloat32.bind(encoder));
    test(stub('fixmap', 'map16', 'map32'), encoder.encodeMap.bind(encoder));
  });

  describe('throws', () => {
    const unsupportedTypes = [() => {}];

    unsupportedTypes.forEach(type => {
      it(`${typeof type} '${type}' could not encode`, () =>
        assert.throws(() => encoder.encode(type), EncodingFailed ));
    });
  });
});

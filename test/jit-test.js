'use strict';

const { ok: assertTrue, deepStrictEqual: assertSame } = require('assert');
const { setFlagsFromString } = require('v8');
const {
  Encoder,
  Decoder,
  Ext,
} = require('../src');

setFlagsFromString('--allow_natives_syntax');

const status = {
  isFunction: 1 << 0,
  NeverOptimize: 1 << 1,
  Optimized: 1 << 4,
  turboFanned: 1 << 5,
};

function assertDeoptedCount(value, fn) {
  assertSame(eval('%GetDeoptCount(fn)'), value);
}

function assertOptimized(code) {
  assertTrue((code & status.NeverOptimize) === 0);
  assertTrue((code & status.isFunction) !== 0, 'not a function');
  assertTrue((code & status.Optimized) !== 0);
  assertTrue((code & status.turboFanned) !== 0);
}

function verify(fn, cb) {
  const f = fn.fn || fn;
  it('optimized ' + fn.name, () => {
    eval('%ClearFunctionFeedback(f)');
    assertDeoptedCount(0, f);

    cb();
    cb();
    eval('%OptimizeFunctionOnNextCall(f)');
    cb();

    assertDeoptedCount(0, f);
    assertOptimized(eval('%GetOptimizationStatus(f)'));
  });
}

describe('JIT', () => {
  const encoder = new Encoder();
  const decoder = new Decoder();

  verify(encoder.encodeNil, () => encoder.encodeNil());
  verify(encoder.encodeBool, () => encoder.encodeBool(true));
  verify(encoder.encodeInt, () => encoder.encodeInt(127));
  verify(encoder.encodeFloat32, () => encoder.encodeFloat32(2.5));
  verify(encoder.encodeFloat64, () => encoder.encodeFloat64(2.5));
  verify(encoder.encodeStr, () => encoder.encodeStr('xyz'));
  verify(encoder.encodeBin, () => encoder.encodeBin(Buffer.from('xyz')));
  verify(encoder.encodeArray, () => encoder.encodeArray(Array.of(1, 2, 3)));
  verify(encoder.encodeObject, () => encoder.encodeObject({ value: 'xyz' }));
  verify(encoder.encodeMap, () => encoder.encodeMap(new Map([[1, 2], [3, 4]])));
  verify(encoder.encodeExt, () => encoder.encodeExt(new Ext(1, 'xyz')));

  const decode = (type) => {
    return { name: `decode ${type}`, fn: decoder.decode };
  };

  verify(decode('nil'), () => decoder.decode(Buffer.from('\xc0')));
  verify(decode('bool'), () => decoder.decode(Buffer.from('\xc3')));
  verify(decode('uint'), () => decoder.decode(Buffer.from('\x7f')));
  verify(decode('float32'), () => decoder.decode(Buffer.from('\xca\x40\x20\x00\x00')));
  verify(decode('float64'), () => decoder.decode(Buffer.from('\xcb\x40\x04\x00\x00\x00\x00\x00\x00')));
  verify(decode('str'), () => decoder.decode(Buffer.from('\xbf\x61\x61\x61\x61')));
  verify(decode('bin'), () => decoder.decode(Buffer.from('\xc4\x03\x61\x61\x61')));
  verify(decode('arr'), () => decoder.decode(Buffer.from('\x93\x00\x00\x00')));
  verify(decode('map'), () => decoder.decode(Buffer.from('\x81\xa1\x30\x00')));
});

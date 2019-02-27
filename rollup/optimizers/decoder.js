'use strict';

const {
  replacerFactory,
  makePropReplacer,
  makeMethodReplacer,
} = require('./factories');

const props = [
  'unexpectedLength',
  'codecs',
  'buffer',
  'offset',
  'length',
];

const methods = [
  'parse',
  'decodeFloat32',
  'decodeFloat64',
  'decodeInt8',
  'decodeInt16',
  'decodeInt32',
  'decodeInt64',
  'decodeUint8',
  'decodeUint16',
  'decodeUint32',
  'decodeUint64',
  'decodeArray',
  'decodeMap',
  'decodeStr',
  'decodeBin',
  'decodeExt',
];

const makeReplacer = replacerFactory();
const propsReplacers = makeReplacer(props, makePropReplacer);
const methodsReplacers = makeReplacer(methods, makeMethodReplacer);

module.exports = {
  'Decoder.js': [...propsReplacers, ...methodsReplacers],
};

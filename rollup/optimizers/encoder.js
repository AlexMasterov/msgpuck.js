'use strict';

const {
  replacerFactory,
  makePropReplacer,
} = require('./factories');

const ifCodecs = code => code
// encode
  .replace(/\((this.codecs).+\)/g, '($1)');

const props = [
// constructor
  'codecs',
  'unsupportedType',
  'encodeObjectKey',
  'objectKeys',
  'isArray',
];

const makeReplacer = replacerFactory();
const propsReplacers = makeReplacer(props, makePropReplacer);

module.exports = {
  'Encoder.js': [ifCodecs, ...propsReplacers],
};

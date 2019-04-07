'use strict';

const { build } = require('../build');
const { mjs } = require('../formats');
const { nodePatch } = require('../patches');
const { esmExportTypes } = require('./typeExports');

build('mjs (node)')(
  mjs({
    input: {
      'index': 'index.js',
      'errors/index': 'errors/index.js',
      'handlers/index': 'handlers/index.js',
      'encoders/index': 'encoders/index.js',
      'codecs/index': 'codecs/index.js',
      'codecs/long/index': 'codecs/long/index.js',
    },
    target: 'dist/latest/mjs',
    external: ['long'],
    exports: esmExportTypes,
    patch: nodePatch,
  }),
).catch(console.error);

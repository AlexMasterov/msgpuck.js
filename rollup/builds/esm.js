'use strict';

const { build } = require('../build');
const { esm } = require('../formats');
const { browserPatch } = require('../patches');
const { esmExportTypes } = require('./typeExports');

build('esm (browser)')(
  esm({
    input: {
      'index': 'index.js',
      'errors/index': 'errors/index.js',
      'handlers/index': 'handlers/index.js',
      'encoders/index': 'encoders/index.js',
      'codecs/index': 'codecs/index.js',
      'codecs/long/index': 'codecs/long/index.js',
    },
    target: `dist/latest/browser`,
    external: ['long'],
    exports: esmExportTypes,
    patch: browserPatch,
    minify: true,
  }),
).catch(console.error);

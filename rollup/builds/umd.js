'use strict';

const { build } = require('../build');
const { umd } = require('../formats');
const { browserPatch } = require('../patches');
const { esmExportTypes } = require('./typeExports');

build('umd (browser)')(
  umd({
    name: 'MsgPuck',
    input: {
      'msgpuck.min.js': 'index.js',
    },
    target: `dist/latest/umd`,
    exports: esmExportTypes,
    patch: browserPatch,
    minify: true,
  }),
).catch(console.error);

'use strict';

const { build } = require('../build');
const { cjs } = require('../formats');
const { v8v67Patch, v8v62Patch } = require('../patches');

build('cjs (node)')(
  cjs({
    target: 'dist/latest/cjs',
  }),
  cjs({
    target: 'dist/v8v67/cjs',
    patch: v8v67Patch ,
  }),
  cjs({
    target: 'dist/v8v62/cjs',
    patch: v8v62Patch,
  }),
).catch(console.error);

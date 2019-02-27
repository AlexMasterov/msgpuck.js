'use strict';

const npm = require('rollup-plugin-node-resolve');
const cjs = require('rollup-plugin-cjs-es');

const { remove, copy } = require('./fs');
const patch = require('./patch');
const terser = require('./terser');

module.exports = {
  cjs,
  copy,
  terser,
  npm,
  patch,
  remove,
};

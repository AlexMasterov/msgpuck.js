'use strict';

const npm = require('rollup-plugin-node-resolve');

const { remove, copy } = require('./fs');
const cjs = require('./cjs');
const patch = require('./patch');
const terser = require('./terser');

module.exports = {
  cjs,
  copy,
  npm,
  transform: patch,
  remove,
  terser,
};

'use strict';

const esm = require('./esm');

const mjs = (options = {}) => {
  const config = esm(options);
  config.output.entryFileNames = '[name].mjs';
  config.output.chunkFileNames = '[name]-[hash].mjs';
  return config;
};

module.exports = mjs;

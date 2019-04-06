'use strict';

const esm = require('./esm');

const umd = ({ name, ...options } = {}) => {
  const config = esm(options);
  config.output.name = name;
  config.output.format = 'umd';
  return config;
};

module.exports = umd;

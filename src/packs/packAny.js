'use strict';

const { PackingFailed } = require('../errors');

const packAny = (value) => {
  throw PackingFailed.withValue(value);
};

module.exports = packAny;

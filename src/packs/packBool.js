'use strict';

const encodeBool = (bool) =>
  bool ? '\xc3' : '\xc2';

module.exports = encodeBool;

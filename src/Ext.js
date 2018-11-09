'use strict';

function required(name) {
  throw new Error(`Missing parameter: ${name}`);
}

class Ext {
  constructor(
    type=required('type'),
    bin=required('bin')
  ) {
    this.type = type;
    this.bin = bin;
  }
}

module.exports = Ext;

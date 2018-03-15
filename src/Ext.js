'use strict';

function required(name) {
  throw new Error(`Missing parameter: ${name}`);
}

class Ext {
  static make(type, data) {
    return new Ext(type, data);
  }

  constructor(
    type = required('type'),
    data = required('data')
  ) {
    this.type = type;
    this.data = data;
  }
}

module.exports = Ext;

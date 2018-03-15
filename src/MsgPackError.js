'use strict';

class MsgPackError extends Error {
  constructor(value, message) {
    super(message);

    this.name = new.target.name;
    this.value = value;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.name);
    }
  }
}

module.exports = MsgPackError;

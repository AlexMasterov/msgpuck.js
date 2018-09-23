'use strict';

class MsgPackError extends Error {
  constructor(value, message) {
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.value = value;
  }
}

module.exports = MsgPackError;

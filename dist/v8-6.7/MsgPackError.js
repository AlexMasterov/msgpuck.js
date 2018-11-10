'use strict';

class MsgPackError extends Error {
  constructor(message) {
    super(message);

    Error.captureStackTrace(this, new.target);

    this.name = new.target.name;
    this.message = message;
  }
}

module.exports = MsgPackError;

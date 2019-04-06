class MsgPackError extends Error {
  constructor(message) {
    super(message);

    Error.captureStackTrace(this, new.target);

    this.name = new.target.name;
    this.message = message;
  }
}

class DecodingFailed extends MsgPackError {
  static fromOffset(offset) {
    return new this(`Cannot decode data with byte-header in position ${offset}`);
  }
}

class EncodingFailed extends MsgPackError {
  static withValue(value) {
    return new this(`Could not encode: ${typeof value}`);
  }
}

class InsufficientData extends DecodingFailed {
  static unexpectedLength(expected, actual) {
    return new this(`Not enough data to decode: expected length ${expected}, got ${actual}`);
  }
}

const _require__$errors_ = (class Errors {
  static get MsgPackError() { return MsgPackError; }
  static get DecodingFailed() { return DecodingFailed; }
  static get EncodingFailed() { return EncodingFailed; }
  static get InsufficientData() { return InsufficientData; }
});

export default _require__$errors_;

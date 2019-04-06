import _require__$errors_ from '../errors/index.mjs';

const { DecodingFailed, InsufficientData } = _require__$errors_;

function throwsDecoderHandler(expectedLength) {
  if (expectedLength === 0) {
    throw DecodingFailed.fromOffset(this.offset);
  }

  throw InsufficientData.unexpectedLength(expectedLength, this.length - this.offset);
}

const { EncodingFailed } = _require__$errors_;

const throwsEncoderHandler = (value) => {
  throw EncodingFailed.withValue(value);
};

const _require__$handlers_ = (class Handlers {
  static get throwsDecoderHandler() { return throwsDecoderHandler; }
  static get throwsEncoderHandler() { return throwsEncoderHandler; }
});

export default _require__$handlers_;

import { DecodingFailed, InsufficientData, EncodingFailed } from '../errors/index.mjs';

function throwsDecoderHandler(expectedLength) {
  if (expectedLength === 0) {
    throw DecodingFailed.fromOffset(this.offset);
  }

  throw InsufficientData.unexpectedLength(expectedLength, this.length - this.offset);
}

const throwsEncoderHandler = (value) => {
  throw EncodingFailed.withValue(value);
};

export { throwsDecoderHandler, throwsEncoderHandler };

'use strict';

const makeExportByDefault = (...expo) =>
  expo.reduce((exports, module) =>
    (exports[module] = 'default', exports), {});

const esmExportTypes = makeExportByDefault(
  'Encoder.js',
  'Decoder.js',
  'Ext.js',
  'errors/MsgPackError.js',
  'errors/EncodingFailed.js',
  'errors/DecodingFailed.js',
  'errors/InsufficientData.js',
  'handlers/throwsEncoderHandler.js',
  'handlers/throwsDecoderHandler.js',
  'encoders/encodeMapHeader.js',
  'encoders/encodeAscii.js',
  'encoders/encodeInt64.js',
  'encoders/selectEncoderFloat.js',
  'codecs/Codec.js',
  'codecs/MapCodec.js',
  'codecs/ScalarObjectCodec.js',
  'codecs/long/LongCodec.js',
  'codecs/long/LongDecode.js',
);

module.exports = {
  esmExportTypes,
  makeExportByDefault,
};

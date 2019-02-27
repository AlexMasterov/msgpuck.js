'use strict';

const { rollup } = require('rollup');

const { esm, cjs } = require('./formats');
const { v8v67Patch, v8v62Patch, browserPatch } = require('./patches');

async function bundle(config) {
  const result = await rollup(config);
  return result.write(config.output);
}

async function build(...configs) {
  await Promise.all(configs.map(bundle));
  console.log('done');
}

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
);

build(
  cjs({
    source: 'src',
    target: `dist/latest/cjs`,
  }),
  cjs({
    source: 'src',
    target: `dist/v8v67/cjs`,
    patch: v8v67Patch ,
  }),
  cjs({
    source: 'src',
    target: `dist/v8v62/cjs`,
    patch: v8v62Patch,
  }),
  esm({
    source: 'src',
    input: 'index.js',
    target: `dist/latest/index.browser.js`,
    exports: esmExportTypes,
    patch: browserPatch,
  }),
  esm({
    source: 'src',
    input: 'index.js',
    target: `dist/latest/index.browser.min.js`,
    exports: esmExportTypes,
    patch: browserPatch,
    minify: true,
  }),
);

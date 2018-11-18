import { toV8v62, toV8v67, toBrowser } from './rollup/patches/index';
import downgrade from './rollup/downgrade';
import browser from './rollup/browser';

import terser from './rollup/plugins/terser';
import size from 'rollup-plugin-bundle-size';

import pkg from './package.json';

export default [
  downgrade({
    distName: 'v8-6.7',
    rootDir: 'src',
    entries: {
      binary: 'binary.js',
      'encoders/selectEncoderFloat': 'encoders/selectEncoderFloat.js',
    },
    plugins: [toV8v67],
  }),
  downgrade({
    distName: 'v8-6.2',
    rootDir: 'dist/v8-6.7',
    entries: {
      Encoder: 'Encoder.js',
      Decoder: 'Decoder.js',
      binary: 'binary.js',
      'encoders/encodeAscii': 'encoders/encodeAscii.js',
      'encoders/encodeInt64': 'encoders/encodeInt64.js',
      'encoders/encodeMapHeader': 'encoders/encodeMapHeader.js',
      'encoders/selectEncoderFloat': 'encoders/selectEncoderFloat.js',
    },
    plugins: [toV8v62],
  }),
  browser({
    input: './dist/v8-6.2/index.js',
    file: pkg.module,
    plugins: [
      toBrowser,
      size(),
    ],
  }),
  {
    input: pkg.module,
    output: {
      file: pkg.module.replace('.js', '.min.js'),
      format: 'esm',
    },
    plugins: [terser],
  },
  {
    input: pkg.module,
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'MsgPuck',
    },
    plugins: [terser],
  },
];

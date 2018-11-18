import { toV8v62, toV8v67, toBrowser } from './rollup/patches/index';
import downgrade from './rollup/downgrade';
import browser from './rollup/browser';

import size from 'rollup-plugin-bundle-size';
import { terser } from 'rollup-plugin-terser';

import { main, module } from './package.json';

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
    file: module,
    plugins: [
      toBrowser,
      size(),
    ],
  }),
  {
    input: module,
    output: {
      file: module.replace('.js', '.min.js'),
      format: 'esm',
    },
    plugins: [
      terser({
        ecma: 6,
        parse: {
          ecma: 8,
        },
        output: {
          ecma: 6,
          quote_style: 3,
          comments: false,
          beautify: false,
        },
        compress: {
          ecma: 6,
          inline: 2,
          toplevel: true,
          warnings: true,
          loops: false,
          booleans: true,
          keep_fnames: false,
          unsafe: true,
          unsafe_math: true,
          unsafe_comps: true,
          unsafe_methods: true,
          unsafe_undefined: true,
        },
        ie8: false,
        toplevel: true,
        keep_classnames: true,
        sourcemap: false,
        warnings: false,
      }),
      size(),
    ],
  },
];

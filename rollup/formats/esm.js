'use strict';

const { remove, npm, cjs, transform, terser } = require('../plugins');
const {
  makeKeyResolver,
  makeInputNormalizer,
  remake,
} = require('./resolvers');

const esm = ({
  src = 'src',
  input,
  target,
  external,
  exports,
  patch,
  minify = false,
}) => ({
  input: {
    ...(input && remake(input, makeInputNormalizer(src))),
  },
  output: {
    format: 'esm',
    dir: target,
    freeze: true,
    interop: true,
    esModule: false,
    preferConst: true,
  },
  treeshake: {
    annotations: false,
    pureExternalModules: true,
    propertyReadSideEffects: false,
  },
  external,
  plugins: [
    patch && transform(remake(patch, makeKeyResolver(src))),
    remove({
      path: target,
    }),
    npm({
      module: true,
      extensions: ['.js'],
      preferBuiltins: false,
    }),
    cjs({
      exports: remake(exports, makeKeyResolver(src)),
    }),
    minify && terser(),
  ],
});

module.exports = esm;

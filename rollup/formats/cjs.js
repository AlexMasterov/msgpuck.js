'use strict';

const { remove, copy, transform } = require('../plugins');
const {
  makeFilepathNormalizer,
  makeInputNormalizer,
  makeKeyResolver,
  makePatchForInput,
  remake,
} = require('./resolvers');

const cjs = ({ src = 'src', input, target, external, patch } = {}) => ({
  input: {
    ...(input && remake(input, makeInputNormalizer(src))),
    ...(patch && remake(patch, makePatchForInput(src))),
  },
  output: {
    dir: target,
    format: 'cjs',
    preferConst: true,
  },
  external,
  plugins: [
    patch && transform(remake(patch, makeKeyResolver(src))),
    remove({
      path: target,
    }),
    copy({
      src,
      dest: target,
      exclude: patch &&
          Object.keys(patch).map(makeFilepathNormalizer(src)),
    }),
  ],
});

module.exports = cjs;

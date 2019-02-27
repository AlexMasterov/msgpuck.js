'use strict';

const { terser } = require('rollup-plugin-terser');

module.exports = (options = {}) =>
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
    ...options,
  });

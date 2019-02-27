'use strict';

const { resolve } = require('path');
const { remove, copy, patch } = require('../plugins');

const trimExt = (filename) => {
  const ext = filename.lastIndexOf('.');
  return ext > 0
    ? filename.slice(0, ext)
    : filename;
};

const cjs = ({ source, target, patch: patches = {} } = {}) => {
  const entries = Object.entries(patches);

  const input = entries.reduce((input, [filename]) =>
    (input[trimExt(filename)] = `${source}/${filename}`, input), {});

  const modules = entries.map(([module, patches]) =>
    [resolve(`${source}/${module}`), patches]);

  return {
    input,
    output: {
      dir: target,
      format: 'cjs',
      preferConst: true,
    },
    plugins: [
      ...(patches && [patch(modules)]),
      remove({
        path: target,
      }),
      copy({
        src: `src`,
        dest: target,
        exclude: input,
      }),
    ],
  };
};

module.exports = cjs;

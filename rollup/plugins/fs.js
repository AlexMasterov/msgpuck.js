'use strict';

const { copySync, removeSync } = require('fs-extra');

const makeFilterPaths = paths => {
  const exclude = new Set(paths);
  return path => !exclude.has(path);
};

const copy = ({ src, dest, exclude, verbose=false } = {}) => {
  const opts = {
    ...(exclude && { filter: makeFilterPaths(exclude) }),
  };

  return {
    name: 'rollup/plugins/copy',
    generateBundle: () => {
      try {
        copySync(src, dest, opts);
      } catch (err) {
        console.error(err);
        throw err;
      }

      if (verbose) {
        console.log(`Successfully copied ${src} -> ${dest}`);
      }
    },
  };
};

const remove = ({ path, verbose=false } = {}) => ({
  name: 'rollup/plugins/remove',
  buildStart: () => {
    try {
      removeSync(path);
    } catch (err) {
      console.error(err);
      throw err;
    }

    if (verbose) {
      console.log(`Successfully deleted ${path}`);
    }
  },
});

module.exports = {
  remove,
  copy,
};

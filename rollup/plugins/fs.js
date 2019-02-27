'use strict';

const { normalize } = require('path');
const { copySync, removeSync } = require('fs-extra');

const makePathSet = (paths) => {
  if (!Array.isArray(paths)) paths = Object.values(paths);
  return new Set(paths.map(normalize));
};

const makeFilterPaths = paths => {
  const exclude = makePathSet(paths);
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

import { copySync, removeSync } from 'fs-extra';

const excludePaths = exclude => {
  if (!Array.isArray(exclude)) exclude = Object.values(exclude);
  return path => !exclude.includes(path.replace(/[\\/\\]/g, '/'));
};

export const copy = ({ src, dest, exclude, verbose=false } = {}) => {
  const opts = {
    filter: exclude && excludePaths(exclude),
  };

  return {
    name: 'copy',
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

export const remove = ({ path, verbose=false } = {}) => ({
  name: 'remove',
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

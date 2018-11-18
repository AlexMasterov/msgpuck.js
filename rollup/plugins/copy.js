import { copySync } from 'fs-extra';

const excludePaths = exclude => {
  if (!Array.isArray(exclude)) exclude = Object.values(exclude);
  return path => !exclude.includes(path.replace(/[\\/\\]/g, '/'));
};

const successMessage = (src, dest) =>
  console.log(`Successfully copied ${src} -> ${dest}`);

export default ({ src, dest, exclude, verbose=false } = {}) => {
  const options = { filter: exclude && excludePaths(exclude) };
  return {
    name: 'copy',
    onwrite: () => {
      try {
        copySync(src, dest, options);
        if (verbose) successMessage(src, dest);
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  };
};

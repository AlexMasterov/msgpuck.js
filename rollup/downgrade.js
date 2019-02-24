import { copy, remove } from './plugins/fs';

export default ({ distName, rootDir, entries, plugins } = {}) => {
  Object.keys(entries).forEach(key =>
    entries[key] = `${rootDir}/${entries[key]}`);

  return {
    input: entries,

    output: {
      dir: `dist/${distName}`,
      format: 'cjs',
    },

    plugins: [
      remove({
        path: `dist/${distName}`,
      }),
      copy({
        src: rootDir,
        dest: `./dist/${distName}`,
        exclude: entries,
      }),
      ...plugins,
    ],
  };
};

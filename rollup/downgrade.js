import del from 'rollup-plugin-delete';
import copy from './plugins/copy';

export default ({ distName, rootDir, entries, plugins } = {}) => {
  Object.keys(entries).forEach(key =>
    entries[key] = `${rootDir}/${entries[key]}`);

  return {
    input: entries,

    output: {
      dir: `dist/${distName}`,
      format: 'cjs',
    },

    experimentalCodeSplitting: true,

    plugins: [
      del({
        targets: `dist/${distName}`,
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

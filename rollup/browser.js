import resolve from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-cjs-es';

export default ({ input, file, plugins } = {}) => ({
  input,

  output: {
    file,
    format: 'esm',
  },

  plugins: [
    ...plugins,
    resolve({
      module: true,
      extensions: ['.js'],
    }),
    cjs({ nested: true }),
  ],
});

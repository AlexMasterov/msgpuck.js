'use strict';

const { resolve } = require('path');
const { remove, npm, cjs, patch, terser } = require('../plugins');

const makeExportTypeFilter = (types) => {
  const exports = new Map(Object.entries(types));
  return (id) => exports.has(id) ? exports.get(id) : null;
};

const esm = ({ source, input, target, exports, patch: patches = {}, minify = false }) => {
  const modules = Object.entries(patches).map(([module, patches]) =>
    [resolve(`${source}/${module}`), patches]);

  exports = Object.entries(exports).reduce((exports, [module, type]) => {
    return (exports[resolve(`${source}/${module}`)] = type, exports);
  }, {});

  return {
    input: `${source}/${input}`,
    output: {
      format: 'esm',
      file: target,
      freeze: false,
      preferConst: true,
    },
    plugins: [
      patches && patch(modules),
      remove({
        path: target,
      }),
      npm({
        module: true,
        extensions: ['.js'],
        preferBuiltins: false,
      }),
      cjs({
        cache: false,
        nested: true,
        sourceMap: false,
        ...(exports && { exportType: makeExportTypeFilter(exports) }),
      }),
      minify && terser(),
    ],
  };
};

module.exports = esm;

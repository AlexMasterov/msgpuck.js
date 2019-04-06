'use strict';

const cjs = require('rollup-plugin-cjs-es');

const makeExportTypeFilter = (exports) => {
  const types = new Map(Object.entries(exports));
  return (id) => types.has(id) ? types.get(id) : null;
};

module.exports = ({ exports, ...options } = {}) =>
  cjs({
    cache: false,
    nested: true,
    sourceMap: false,
    ...options,
    ...(exports && { exportType: makeExportTypeFilter(exports) }),
  });

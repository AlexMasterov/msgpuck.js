'use strict';

// Node
const classRequire = code => code
  .replace(/class [^{]+/g, '')
  .replace(/static? get (.+)\(\)[^}]+}/g, `$1: require('./$1'),`);

const indexPatch = (...indexes) =>
  indexes.reduce((patches, index) =>
    (patches[`${index}index.js`] = [classRequire], patches), {});

module.exports = {
  indexPatch,
};

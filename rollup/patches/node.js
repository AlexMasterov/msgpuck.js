'use strict';

const indexPatch = (...indexes) =>
  indexes.reduce((patches, index) =>
    (patches[`${index}index.js`] = [classRequire], patches), {});

// index
const classRequire = code => code
  .replace(/class [^{]+/g, '')
  .replace(/static? get (.+)\(\)[^}]+}/g, `$1: require('./$1'),`);

const removeExportFromIndex = code => code
  .replace(/\s{1,5}static? get (handlers|errors|codecs)[^}]+}/g, '');

module.exports = {
  'index.js': [removeExportFromIndex, classRequire],
  ...indexPatch('errors/', 'handlers/', 'encoders/', 'codecs/', 'codecs/long/'),
};

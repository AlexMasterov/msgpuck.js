'use strict';

const { resolve } = require('path');

const remake = (obj, fn) =>
  Object.entries(obj).reduce((obj, [key, value]) => {
    [key, value] = fn(key, value);
    return (obj[key] = value, obj);
  }, {});

// cjs
const trimExt = (filename) => {
  const ext = filename.lastIndexOf('.');
  return ext > 0 ? filename.slice(0, ext) : filename;
};

const makeInputNormalizer = (dir) => (key, value) =>
  [trimExt(key), resolve(`${dir}/${value}`)];

const makePatchForInput = (dir) => (key) =>
  [trimExt(key), resolve(`${dir}/${key}`)];

// path
const makeKeyResolver = (dir) => (key, value) =>
  [resolve(`${dir}/${key}`), value];

// fs/copy, cjs
const makeFilepathNormalizer = (dir) => (value) =>
  resolve(`${dir}/${value}`);

module.exports = {
  makeInputNormalizer,
  makePatchForInput,
  makeFilepathNormalizer,
  makeKeyResolver,
  remake,
};

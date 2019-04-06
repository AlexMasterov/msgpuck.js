'use strict';

const { rollup } = require('rollup');

async function bundle(config) {
  const result = await rollup(config);
  return result.write(config.output);
}

function build(name = 'Noname') {
  return async function (...configs) {
    await Promise.all(configs.map(bundle));
    console.log(`${name} done`);
  };
}

module.exports = {
  build,
};

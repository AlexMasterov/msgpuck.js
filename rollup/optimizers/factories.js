'use strict';

const regexp = (pattern) => new RegExp(pattern, 'g');

function* makeCharGenerator({ start=97 } = {}) {
  while (true) yield String.fromCharCode(start++);
}

const replacerFactory = (chars = makeCharGenerator()) => (target, fn) =>
  target.map((it) => fn(it, chars.next().value));

const makePropReplacer = (prop, char) => code => code
  .replace(regexp(`this.${prop}`), `this.${char}`);

const makeMethodReplacer = (method, char) => code => code
  .replace(regexp(`this.${method}`), `this.${char}`)
  .replace(regexp(method), char);

module.exports = {
  makeCharGenerator,
  makeMethodReplacer,
  makePropReplacer,
  replacerFactory,
};

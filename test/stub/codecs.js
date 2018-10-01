'use strict';

const {
  BooleanCodec,
  ErrorCodec,
  MapCodec,
  NumberCodec,
  RegExpCodec,
  SetCodec,
  StringCodec,
  SymbolCodec,
  UndefinedCodec,
} = require('../../src/codecs');

const codec = (name, codec, encode, decode) => ({ name, codec, encode, decode });

const codecs = {
  'undefined': [
    codec('UndefinedCodec', UndefinedCodec.make(), undefined, undefined),
  ],

  'Symbol': [
    codec('SymbolCodec', SymbolCodec.make(), Symbol('xyz'), Symbol('xyz')),
    codec('SymbolCodec for', SymbolCodec.withFor(), Symbol('xyz'), Symbol('xyz')),
  ],

  'String': [
    codec('StringCodec', StringCodec.make(), new String('xyz'), 'xyz'),
  ],

  'Number': [
    codec('NumberCodec', NumberCodec.make(), new Number(42), 42),
  ],

  'Boolean': [
    codec('BooleanCodec', BooleanCodec.make(), new Boolean(true), true),
  ],

  'RegExp': [
    codec('RegExpCodec', RegExpCodec.make(), /xyz/, new RegExp(/xyz/)),
    codec('RegExpCodec /i', RegExpCodec.make(), /xyz/i, new RegExp(/xyz/i)),
  ],

  'Error': [
    codec('ErrorCodec', ErrorCodec.make(), new Error('xyz', 'Error'), new Error('xyz', 'Error')),
  ],

  'Set': [
    codec('SetCodec', SetCodec.make(), new Set([['xyz', 42]]), new Set([['xyz', 42]])),
  ],

  'Map': [
    codec('MapCodec', MapCodec.make(), new Map([['xyz', 42]]), new Map([['xyz', 42]])),
  ],
};

module.exports = codecs;

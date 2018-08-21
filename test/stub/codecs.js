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

const codecs = {
  undefined: [
    { name: 'UndefinedCodec.make', codec: UndefinedCodec.make(),
      encode: undefined, decode: undefined },
  ],
  'Symbol': [
    { name: 'SymbolCodec.make', codec: SymbolCodec.make(),
      encode: Symbol('xyz'), decode: Symbol('xyz') },
    { name: 'SymbolCodec.withFor', codec: SymbolCodec.withFor(),
      encode: Symbol('xyz'), decode: Symbol('xyz') },
  ],
  'String': [
    { name: 'StringCodec.make', codec: StringCodec.make(),
      encode: new String('xyz'), decode: new String('xyz') },
    { name: 'StringCodec.withValueOf', codec: StringCodec.withValueOf(),
      encode: new String('xyz'), decode: 'xyz' },
  ],
  'Number': [
    { name: 'NumberCodec.make', codec: NumberCodec.make(),
      encode: new Number(42), decode: new Number(42) },
    { name: 'NumberCodec.withValueOf', codec: NumberCodec.withValueOf(),
      encode: new Number(42), decode: 42 },
  ],
  'Boolean': [
    { name: 'BooleanCodec.make', codec: BooleanCodec.make(),
      encode: new Boolean(true), decode: new Boolean(true) },
    { name: 'BooleanCodec.withValueOf', codec: BooleanCodec.withValueOf(),
      encode: new Boolean(true), decode: true },
  ],
  'RegExp': [
    { name: 'RegExpCodec.make', codec: RegExpCodec.make(),
      encode: /xyz/i, decode: new RegExp(/xyz/i) },
    { name: 'RegExpCodec.make', codec: RegExpCodec.make(),
      encode: /xyz/, decode: new RegExp(/xyz/) },
  ],
  'Error': [
    { name: 'ErrorCodec.make', codec: ErrorCodec.make(),
      encode: new Error('xyz', 'Error'), decode: new Error('xyz', 'Error') },
  ],
  'Set': [
    { name: 'SetCodec.make', codec: SetCodec.make(),
      encode: new Set([['xyz', 42]]), decode: new Set([['xyz', 42]]) },
  ],
  'Map': [
    { name: 'MapCodec.make', codec: MapCodec.make(),
      encode: new Map([['xyz', 42]]), decode: new Map([['xyz', 42]]) },
  ],
};

module.exports = codecs;

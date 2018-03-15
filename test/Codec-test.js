'use strict';

const { deepStrictEqual: assertSame, throws } = require('assert');
const {
  Encoder,
  Decoder,
  Codec,
  codecs: {
    BooleanCodec,
    ErrorCodec,
    MapCodec,
    NumberCodec,
    RegExpCodec,
    SetCodec,
    StringCodec,
    SymbolCodec,
    UndefinedCodec,
  },
} = require('../src');

const toBin = (data) => Buffer.from(data, 'binary');

function* codecs() {
  yield [UndefinedCodec.make(), undefined, undefined];
  yield [StringCodec.make(), new String('xyz'), new String('xyz')];
  yield [StringCodec.withValueOf(1), new String('xyz'), 'xyz'];
  yield [NumberCodec.make(), new Number(42), new Number(42)];
  yield [NumberCodec.withValueOf(), new Number(42), 42];
  yield [BooleanCodec.make(), new Boolean(true), new Boolean(true)];
  yield [BooleanCodec.withValueOf(), new Boolean(true), true];
  yield [RegExpCodec.make(), /xyz/i, new RegExp(/xyz/i)];
  yield [SymbolCodec.make(), Symbol('xyz'), Symbol('xyz')];
  yield [SymbolCodec.withFor(), Symbol('xyz'), Symbol('xyz')];
  yield [ErrorCodec.make(), new Error('xyz', 'Error'), new Error('xyz', 'Error')];
  yield [SetCodec.make(), new Set([['xyz', 42]]), new Set([['xyz', 42]])];
  yield [MapCodec.make(), new Map([['xyz', 42]]), new Map([['xyz', 42]])];
}

function verify(codec, encode, decode) {
  let title = codec.constructor.name || 'unknown';
  if (codec.valueOf === true) title += ' withValueOf';
  if (codec.withFor === true) title += ' withFor';

  it(title, () => {
    const options = { codecs: [codec] };
    const encoder = new Encoder(options);
    const decoder = new Decoder(options);

    const encoded = encoder.encode(encode);
    const decoded = decoder.decode(toBin(encoded));

    if (typeof decode === 'symbol') {
      assertSame(decoded.toString(), decode.toString());
      return;
    }

    assertSame(decoded, decode);
  });
}

describe('Codec', () => {
  for (const data of codecs()) {
    verify(...data);
  }

  it('throws when methods is not implemented', () => {
    const codec = new Codec();

    throws(() => { codec.supports('not implemented'); }, Error);
    throws(() => { codec.encode('not implemented'); }, Error);
    throws(() => { codec.decode('not implemented'); }, Error);
  });
});

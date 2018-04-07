# msgpuck

[![npm](https://img.shields.io/npm/v/msgpuck.svg)](https://github.com/AlexMasterov/msgpuck.js)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://travis-ci.org/AlexMasterov/msgpuck.js.svg)](https://travis-ci.org/AlexMasterov/msgpuck.js)
[![Coverage Status](https://coveralls.io/repos/github/AlexMasterov/msgpuck.js/badge.svg?branch=master)](https://coveralls.io/github/AlexMasterov/msgpuck.js?branch=master)

A fast and memory-efficient [MessagePack](https://msgpack.org) serialization library.

## Features

* Fully compliant with the latest [MessagePack specification](https://github.com/msgpack/msgpack/blob/master/spec.md#messagepack-specification)
* Faster than any other pure JavaScript libraries on Node.js v9 (**50% faster** on encoding)
* Supports signed/unsigned 64-bit integers handling
* Supports custom Extension Types (Serialization Codecs)
* [Fully tested](https://travis-ci.org/AlexMasterov/msgpuck.js), including V8 JIT optimizations

## Future works (not implemented yet)

* Native/Node.js streaming encoding and decoding interface
* Command Line Interface
* Web browsers

## Table of contents

* [Installation](#installation)
* [Usage](#usage)
  * [Encoding](#encoding)
  * [Decoding](#decoding)
* [Extensions](#extensions)
* [Custom types (Codecs)](#custom-types-codecs)
  * [Built-in Codecs](#built-in-codecs)
* [Errors](#errors)
* [Tests](#tests)
* Benchmarks
* [License](#license)

## Installation

```
npm install msgpuck
```

## Usage
## Encoding
To encode values you can either use an instance of `Encoder`:
```javascript
const { Encoder } = require('msgpuck');

const encoder = new Encoder();

...

encoder.encode(value); // string(encoded values)
```
A list of all low-level encoder methods:
```javascript
encoder.encodeNil();                    // MP nil
encoder.encodeBool(true);               // MP bool
encoder.encodeInt(42);                  // MP int
encoder.encodeFloat32(Math.PI);         // MP float 32
encoder.encodeFloat64(Math.PI);         // MP float 64
encoder.encodeStr('foo');               // MP str
encoder.encodeBin(Buffer.from([0x2a])); // MP bin
encoder.encodeArray([1, 2]);            // MP array
encoder.encodeObject({ 1: 'bar' });     // MP map
encoder.encodeMap(new Map([[1, 2]]);    // MP map
encoder.encodeExt(Ext.make(1, '\x2a')); // MP ext
```
## Decoding
To decode data (buffer) you can either use an instance of `Decoder`:
```javascript
const { Decoder } = require('msgpuck');

const decoder = new Decoder();

...

decoder.decode(buffer);
```

## Extensions
To define application-specific types use the `Ext` class:

```javascript
const { Encoder, Decoder, Ext } = require('msgpuck');

const encoded = (new Encoder).encode(Ext.make(42, '\x2a'));

const buffer = Buffer.from(encoded, 'binary');
const ext = (new Decoder).decode(buffer);

console.log(ext.type === 42); // bool(true)
console.log(ext.data === '\x2a'); // bool(true)
```

## Custom types (Codecs)
For example, the code below shows how to add
[`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object support:
```javascript
const { Codec } = require('msgpuck');

class MapCodec extends Codec {
  static get type() { // option, specify the default type
    return 0x01;
  }

  supports(value) { // required
    return value.constructor === Map; // the fast comparison
  }

  encode(value) { // required
    return [...value]; // array destructuring uses an iterator
  }

  decode(data) { // required
    return new Map(data);
  }
}
```
```javascript
const { Encoder, Decoder } = require('msgpuck');

const options = { codecs: [MapCodec.make()] };
const encoder = new Encoder(options);
const decoder = new Decoder(options);

const encoded = encoder.encode(new Map([[1, 'bar']]));

const buffer = Buffer.from(encoded, 'binary');
decoder.decode(buffer); // Map { 1 => 'bar' }
```

## Built-in Codecs

 Name              | Type           | Option      | Name             | Type   |
-------------------|----------------|-------------|------------------|--------|
BooleanCodec       | `0x01`         | withValueOf | RegExpCodec      | `0x0b` |
NumberCodec        | `0x02`         | withValueOf | MapCodec         | `0x0c` |
StringCodec        | `0x03`         | withValueOf | SetCodec         | `0x0d` |
BigIntCodec        | `0x04`         | withValueOf | ErrorCodec       | `0x0e` |
SymbolCodec        | `0x0a`         | withFor     | UndefinedCodec   | `0x0f` |

Example:
```javascript
const {
  Decoder,
  Encoder,
  codecs: { StringCodec, MapCodec },
} = require('msgpuck');

const codecs = [StringCodec.withValueOf(), MapCodec.make(0x05)];

const encoder = new Encoder({ codecs });
const decoder = new Decoder({ codecs });
```

## Errors
If an error occurs during encoding or decoding, a `EncodingFailed` or `DecodingFailed` will be thrown, respectively.

In addition, there are one more error that can be thrown during decoding:
* `InsufficientData`

The error can occur due to `unsupported type` during encoding or `unknown a byte-header` during decoding, and at the
unexpected end of `data`. Each value can be get via `err.value`.

To catch all the errors just use `MsgPackError`.

Example:

```javascript
const {
  Decoder,
  MsgPackError,
  errors: { DecodingFailed },
} = require('msgpuck');

try {
  (new Decoder).decode(Buffer.from([0xc1])); // the unknown byte-header
} catch (err) {
  console.log(err instanceof DecodingFailed); // bool(true)
  console.log(err instanceof MsgPackError); // bool(true)
  console.log(err.value === 0xc1); // bool(true)
}
```

## Tests
Run tests as follows:

```
npm run test
```

## License
Copyright &#169; 2018-present Alex Masterov &lt;alex.masterow@gmail.com&gt;

MsgPuck is licensed under MIT and can be used for any personal or commercial project.

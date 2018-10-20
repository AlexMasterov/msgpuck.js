// Type definitions for msgpuck 0.7.0
// Project: https://github.com/AlexMasterov/msgpuck.js
// Definitions by: Alex Masterov <https://github.com/AlexMasterov>
// TypeScript Version: 3.1

/// <reference lib="es5" />
/// <reference lib="es2015.collection" />
/// <reference types="node" />

declare module 'msgpuck' {
  namespace codecs {
    interface UndefinedValue {
      readonly __isUndefined__: true;
    }

    class CanWithFor extends Codec {
      private withFor: boolean;

      public static withFor(type?: number): CanWithFor;
    }

    class UndefinedCodec extends Codec {
      public encode(encoder: Encoder, value: UndefinedValue): EncodedResult;
      public decode(decoder: Decoder, length: number): undefined | errors.DecodingFailed;
    }

    class BooleanCodec extends Codec {
      public encode(encoder: Encoder, value: Boolean): EncodedResult;
      public decode(decoder: Decoder, length: number): boolean | errors.DecodingFailed;
    }

    class NumberCodec extends Codec {
      public encode(encoder: Encoder, value: Number): EncodedResult;
      public decode(decoder: Decoder, length: number): number | errors.DecodingFailed;
    }

    class StringCodec extends Codec {
      public encode(encoder: Encoder, value: String): EncodedResult;
      public decode(decoder: Decoder, length: number): string | errors.DecodingFailed;
    }

    class SymbolCodec extends CanWithFor {
      public encode(encoder: Encoder, value: Symbol): EncodedResult;
      public decode(decoder: Decoder, length: number): Symbol | errors.DecodingFailed;
    }

    class RegExpCodec extends Codec {
      public encode(encoder: Encoder, value: RegExp): EncodedResult;
      public decode(decoder: Decoder, length: number): RegExp | errors.DecodingFailed;
    }

    class ErrorCodec extends Codec {
      public encode(encoder: Encoder, value: Error): EncodedResult;
      public decode(decoder: Decoder, length: number): Error | errors.DecodingFailed;
    }

    class MapCodec extends Codec {
      public encode(encoder: Encoder, value: Map<any, any>): EncodedResult;
      public decode(decoder: Decoder, length: number): Map<any, any> | errors.DecodingFailed;
    }

    class SetCodec extends Codec {
      public encode(encoder: Encoder, value: Set<any>): EncodedResult;
      public decode(decoder: Decoder, length: number): Set<any> | errors.DecodingFailed;
    }
  }

  namespace errors {
    class MsgPackError extends Error { }

    class EncodingFailed extends MsgPackError { }

    class DecodingFailed extends MsgPackError { }

    class InsufficientData extends DecodingFailed { }
  }

  abstract class Codec {
    readonly type: number;

    public static make(type?: number): Codec;

    constructor(type?: number);

    public supports(value: any): boolean;
    public encode(encoder: Encoder, value: any): EncodedResult;
    public decode(decoder: Decoder, length: number): DecodedResult;
  }

  type EncodedBinary = string;
  type EncodedResult = EncodedBinary | errors.EncodingFailed;
  type DecodedResult = any | errors.DecodingFailed;

  type EncoderHandler = (value: any) => EncodedResult;
  type DecoderHandler = (byte: number, expectedLength: number) => DecodedResult;

  // type DecodeInt64 = () => number | BigInt;

  interface DecoderOption {
    /**
     * @default 6
     */
    bufferMinLen?: number;

    /**
     * @default throwsEncoderHandler
     */
    handler?: DecoderHandler;

    /**
     * @default false
     */
    codecs?: CodecOption;
  }

  class Decoder {
    private handler: DecoderHandler;
    // private decodeUint64: DecodeInt64;
    // private decodeInt64: DecodeInt64;
    private codecs: CodecOption;
    private buffer: null | Buffer;
    private offset: number;
    private length: number;
    private bufferMinLen: number;

    constructor(options?: DecoderOption);

    public decode(buffer: Buffer): DecodedResult;
  }

  type EncoderFloat = (num: number) => EncodedBinary;
  // type EncoderBigInt = (bignum: BigInt) => EncodedBinary;
  type CodecOption = ReadonlyArray<Codec> | false;

  interface EncoderOption {
    /**
     * @default '64'
     */
    float?: '32' | '64' | 'auto';

    /**
     * @default 15
     */
    bufferMinLen?: number;

    /**
     * @default throwsEncoderHandler
     */
    handler?: EncoderHandler;

    /**
     * @default false
     */
    codecs?: CodecOption;
  }

  class Encoder {
    private handler: EncoderHandler;
    private encodeFloat: EncoderFloat;
    // private encodeBigInt: EncoderBigInt;
    private codecs: CodecOption;
    private alloc: number;
    private buffer: null | Buffer;
    private bufferMinLen: number;

    constructor(options?: EncoderOption);

    public encode(value: any): EncodedResult;
    public encodeNil(): EncodedBinary;
    public encodeBool(bool: boolean): EncodedBinary;
    public encodeInt(num: number): EncodedBinary;
    // public encodeBigInt(bignum: BigInt): EncodedBinary;
    public encodeStr(str: string): EncodedBinary;
    public encodeBin(bin: Buffer): EncodedBinary;
    public encodeArray(arr: ArrayLike<any>): EncodedBinary;
    public encodeObject(obj: object): EncodedBinary;
    public encodeMap(map: Map<any, any>): EncodedBinary;
    public encodeExt(type: number, bin: EncodedBinary): EncodedBinary;
  }

  class Ext {
    readonly type: number;
    readonly bin: EncodedBinary;

    public static make(type: number, bin: EncodedBinary): Ext;

    constructor(type: number, bin: EncodedBinary);
  }
}

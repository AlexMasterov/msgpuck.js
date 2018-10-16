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
    private buffer: null | Buffer;
    private offset: number;
    private length: number;
    private bufferMinLen: number;
    private handler: DecoderHandler;
    private codecs: CodecOption;

    constructor(options?: DecoderOption);

    public decode(buffer: Buffer): DecodedResult;
  }

  type EncoderFloat = (num: number) => EncodedBinary;
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
    private encodeFloat: EncoderFloat;
    private alloc: number;
    private buffer: null | Buffer;
    private bufferMinLen: number;
    private handler: EncoderHandler;
    private codecs: CodecOption;

    constructor(options?: EncoderOption);

    public encode(value: any): EncodedResult;
    public encodeNil(): EncodedBinary;
    public encodeBool(bool: boolean): EncodedBinary;
    public encodeInt(num: number): EncodedBinary;
    public encodeStr(str: string): EncodedBinary;
    public encodeBin(bin: Buffer): EncodedBinary;
    public encodeArray(arr: ArrayLike<any>): EncodedBinary;
    public encodeObject(obj: object): EncodedBinary;
    public encodeMap(map: Map<any, any>): EncodedBinary;
    public encodeExt(type: number, data: EncodedBinary): EncodedBinary;
  }

  class Ext {
    readonly type: number;
    readonly data: EncodedBinary;

    public static make(type: number, data: EncodedBinary): Ext;

    constructor(type: number, data: EncodedBinary);
  }
}

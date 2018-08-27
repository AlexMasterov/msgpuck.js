// Type definitions for msgpuck 0.5.6
// Project: https://github.com/AlexMasterov/msgpuck.js
// Definitions by: Alex Masterov <https://github.com/AlexMasterov>
// TypeScript Version: 3.1

/// <reference lib="es5" />
/// <reference lib="es2015.collection" />
/// <reference types="node" />

declare module 'msgpuck' {
  type CodecOption = ReadonlyArray<Codec> | false;

  interface EncoderOption {
    /**
     * @default 15
     */
    bufferMinlen?: number;

    /**
     * @default false
     */
    codecs?: CodecOption;

    /**
     * @default false
     */
    float32?: boolean;
  }

  class Encoder {
    private alloc: number;
    private buffer: null | Buffer;
    private bufferMinlen: number;
    private codecs: CodecOption;

    constructor(options?: EncoderOption);

    public encode(value: any): string | errors.EncodingFailed;

    public encodeNil(): string;

    public encodeBool(bool: boolean): string;

    public encodeFloat32(num: number): string;

    public encodeFloat64(num: number): string;

    public encodeInt(num: number): string;

    public encodeStr(str: string): string;

    public encodeBin(bin: Buffer): string;

    public encodeArray(arr: ArrayLike<any>): string;

    public encodeObject(obj: object): string;

    public encodeMap(map: Map<any, any>): string;

    public encodeExt(ext: Ext): string;
  }

  interface DecoderOption {
    /**
     * @default 6
     */
    bufferMinlen?: number;

    /**
     * @default false
     */
    codecs?: CodecOption;
  }

  class Decoder {
    private buffer: null | Buffer;
    private length: number;
    private offset: number;
    private codecs: CodecOption;
    private bufferMinlen: number;

    constructor(options?: DecoderOption);

    public decode(buffer: Buffer): any;
  }

  namespace errors {
    class MsgPackError extends Error {
      readonly value: any;
    }

    class EncodingFailed extends MsgPackError { }

    class DecodingFailed extends MsgPackError { }

    class InsufficientData extends DecodingFailed { }
  }

  class Ext {
    readonly type: number;
    readonly data: any;

    public static make(type: number, data: any): Ext;

    constructor(type: number, data: any);
  }

  abstract class Codec {
    readonly type: number;

    public static make(type?: number): Codec;

    constructor(type?: number);

    public supports(value: any): boolean;

    public encode(value: any): any;

    public decode(data: any): any;
  }

  class CanValueOf extends Codec {
    private valueOf: boolean;

    public static withValueOf(type?: number): CanValueOf;
  }

  class CanWithFor extends Codec {
    private withFor: boolean;

    public static withFor(type?: number): CanWithFor;
  }

  type BooleanType = boolean | Boolean;
  type NumberType = number | Number;
  type StringType = string | String;

  interface ErrorValue {
    readonly message: string;
    readonly name: string;
  }

  interface UndefinedValue {
    readonly __isUndefined__: true;
  }

  namespace codecs {
    class BooleanCodec extends CanValueOf {
      public encode(value: BooleanType): boolean;

      public decode(data: boolean): BooleanType;
    }

    class ErrorCodec extends Codec {
      public encode(value: Error): ErrorValue;

      public decode(data: ErrorValue): Error;
    }

    class MapCodec extends Codec {
      public encode(value: Map<any, any>): string;

      public decode(data: any): Map<any, any>;
    }

    class NumberCodec extends CanValueOf {
      public encode(value: NumberType): number;

      public decode(data: number): NumberType;
    }

    class RegExpCodec extends Codec {
      public encode(value: RegExp): string[];

      public decode(data: string[]): RegExp;
    }

    class SetCodec extends Codec {
      public encode(value: Set<any>): string;

      public decode(data: any): Set<any>;
    }

    class StringCodec extends CanValueOf {
      public encode(value: StringType): string;

      public decode(data: string): StringType;
    }

    class SymbolCodec extends CanWithFor {
      public encode(value: Symbol): string;

      public decode(data: string): Symbol;
    }

    class UndefinedCodec extends Codec {
      public encode(value: UndefinedValue): null;

      public decode(data: null): undefined;
    }
  }
}

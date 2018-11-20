// Type definitions for msgpuck 0.8.1
// Project: https://github.com/AlexMasterov/msgpuck.js
// Definitions by: Alex Masterov <https://github.com/AlexMasterov>
// TypeScript Version: 3.1

/// <reference lib="es5" />
/// <reference lib="es2015.collection" />
/// <reference types="node" />

declare module 'msgpuck' {
  type EncodedBinary = string;

  type EncodedResult = EncodedBinary | errors.EncodingFailed;
  type DecodedResult = any | errors.DecodingFailed;
  type CodecResult = EncodedResult | null;

  type EncoderHandler = (value: any) => EncodedResult;
  type DecoderHandler = (expectedLength: number) => DecodedResult;

  type CodecOption = ReadonlyArray<Codec> | false;

  type EncoderFloat = (num: number) => EncodedBinary;
  type EncodeObjectKey = (str: string) => EncodedBinary;
  type ObjectKeys = (obj: object) => string[];
  // type EncoderBigInt = (bignum: BigInt) => EncodedBinary;

  // @see https://github.com/Microsoft/TypeScript/issues/15480
  type ApplicationTypes = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
    | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31
    | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42
    | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53
    | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64
    | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75
    | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86
    | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97
    | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107
    | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117
    | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127;

  interface EncoderOption {
    /**
     * @default handlers.throwsEncoderHandler
     */
    handler?: EncodeObjectKey;

    /**
     * @default '64'
     */
    float?: '32' | '64' | 'auto';

    /**
     * @default 'ascii'
     */
    objectKey?: 'ascii' | 'utf8';

    /**
     * @default Object.keys
     */
    objectKeys?: ObjectKeys;

    /**
     * @default false
     */
    codecs?: CodecOption;

    /**
     * @default 15
     */
    bufferMinLen?: number;

    /**
     * @default 2048
     */
    bufferMinAlloc?: number;
  }

  class Encoder {
    private unsupportedType: EncoderHandler;
    private encodeFloat: EncoderFloat;
    private encodeObjectKey: EncodeObjectKey;
    private objectKeys: ObjectKeys;
    // private encodeBigInt: EncoderBigInt;
    private codecs: CodecOption;
    private buffer: Buffer | null;
    private bufferAlloc: number;
    private bufferMinLen: number;
    private bufferMinAlloc: number;

    new (options?: EncoderOption): Encoder;

    public encode(value: any): EncodedResult;
    public encodeNil(): EncodedBinary;
    public encodeBool(bool: boolean): EncodedBinary;
    public encodeInt(num: number): EncodedBinary;
    // public encodeBigInt(bignum: BigInt): EncodedBinary;
    public encodeStr(str: string): EncodedBinary;
    public encodeBin(bin: Buffer): EncodedBinary;
    public encodeArray(arr: ArrayLike<any>): EncodedBinary;
    public encodeObject(obj: object): EncodedBinary;
    public encodeExt(type: ApplicationTypes, bin: EncodedBinary): EncodedBinary;
  }

  interface DecoderOption {
    /**
     * @default handlers.throwsDecoderHandler
     */
    handler?: DecoderHandler;

    /**
     * @default false
     */
    codecs?: CodecOption;

    /**
     * @default 15
     */
    bufferMinLen?: number;
  }

  class Decoder {
    private unexpectedLength: EncoderHandler;
    private codecs: CodecOption;
    private buffer: Buffer | null;
    private bufferMinLen: number;
    private offset: number;
    private length: number;

    new (options?: DecoderOption): Decoder;

    public decode(buffer: Buffer, start?: number, end?: number): DecodedResult;
  }

  abstract class Codec {
    /**
     * @default 0x00
     */
    readonly type: ApplicationTypes;

    new (type?: ApplicationTypes): Codec;
  }

  class Ext {
    readonly type: ApplicationTypes; // 0 - 127
    readonly bin: EncodedBinary;

    new (type: ApplicationTypes, bin: EncodedBinary): Ext;
  }

  namespace codecs {
    class MapCodec extends Codec {
      public encode(encoder: Encoder, value: any): CodecResult;
      public decode(decoder: Decoder, length: number): DecodedResult;
    }

    class ScalarObjectCodec {
      public encode(encoder: Encoder, value: any): CodecResult;
    }

    class LongCodec {
      public encode(encoder: Encoder, value: any): CodecResult;
    }

    function decodeLong(): DecodedResult;
  }

  namespace handlers {
    function throwsEncoderHandler(value: any): EncodedResult;
    function throwsDecoderHandler(expectedLength: number): DecodedResult;
  }

  namespace errors {
    class MsgPackError extends Error { }

    class EncodingFailed extends MsgPackError {
      public static withValue(value: any): EncodingFailed;
    }

    class DecodingFailed extends MsgPackError {
      public static fromOffset(offset: number): DecodingFailed;
    }

    class InsufficientData extends DecodingFailed {
      public static unexpectedLength(expected: number, actual: number): InsufficientData;
    }
  }
}

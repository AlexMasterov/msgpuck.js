'use strict';

const { MessagePack: mp, JavaScript } = require('./data');
const js = JavaScript.make();

class DataType {
  static* nil() {
    yield ['c0', null];
  }

  static* bool() {
    yield ['c2', false];
    yield ['c3', true];
  }

  static* uint() {
    // 5 positive fixint
    yield ['00', 0];
    yield ['7f', 127];
    // 8
    yield ['cc80', 128];
    yield ['ccff', 255];
    // 16
    yield ['cd0100', 256];
    yield ['cdffff', 65535];
    // 32
    yield ['ce00010000', 65536];
    yield ['ceffffffff', 4294967295];
    // 64
    yield ['cf0000000100000000', 4294967296];
    yield ['cf001fffffffffffff', Number.MAX_SAFE_INTEGER];
  }

  static* int() {
    // 5 negative fixint
    yield ['ff', -1];
    yield ['e0', -32];
    // 8
    yield ['d0df', -33];
    yield ['d080', -128];
    // 16
    yield ['d1ff7f', -129];
    yield ['d18000', -32768];
    // 32
    yield ['d2ffff7fff', -32769];
    yield ['d280000000', -2147483648];
    // 64
    yield ['d3ffffffff7fffffff', -2147483649];
    yield ['d3fffffffeffffffff', -4294967297];
    yield ['d3ffffc47c1c1de2b1', -65437650001231];
    yield ['d3fffa8e0992bfa747', -1532678092380345];
    yield ['d3ffe42540896a3a21', -7840340234323423];
    yield ['d3ffe0000000000001', -Number.MAX_SAFE_INTEGER];
  }

  static* float32() {
    yield ['ca40200000', 2.5];
    yield ['ca00000080', 1.793662034335766e-43];
    yield ['ca0000803f', 4.600602988224807e-41];
    yield ['ca0000807f', 4.609571298396486e-41];
    yield ['ca000080ff', 4.627507918739843e-41];
    // yield ['caba00fafc', -0.0004920212086290121];
    // yield ['ca00000000', -1.055058432344064e+37];
    // yield ['ca00000000', -6.568051909668895e+35];
    // yield ['ca3eaaaaab', 0.3333333432674408];
    // yield ['ca00fafcfd', 2.30496291345398e-38];
    // yield ['ca00000000', Infinity];
    // yield ['ca00000000', -Infinity];
  }

  static* float64() {
    yield ['cb4004000000000000', 2.5];
    yield ['cb000000000000f03f', 3.03865e-319];
    yield ['cb0000000000000040', 3.16e-322];
    yield ['cb0000000000001000', 2.0237e-320];
    yield ['cb00000000000000c0', 9.5e-322];
    yield ['cb3ff0000000000001', 1.0000000000000002];
    yield ['cb7ff8000000000000', Number.NaN];
    yield ['cb7ff0000000000000', Number.POSITIVE_INFINITY];
    yield ['cbfff0000000000000', Number.NEGATIVE_INFINITY];
    // yield ['cb3718000000000000', 2.6904930515036488e-43];
    // yield ['cbbd755547c0000000', -1.2126478207002966e-12];
  }

  static* str() {
    // 5 fixstr a0 - bf
    yield [mp.str(0), js.str(0)];
    yield [mp.str(31), js.str(31)];
    // 8 d9
    yield [mp.str(32), js.str(32)];
    yield [mp.str(255), js.str(255)];
    // 16 da
    yield [mp.str(256), js.str(256)];
    yield [mp.str(65535), js.str(65535)];
    // 32 db
    yield [mp.str(65536), js.str(65536)];
  }

  static* unicode() {
    // 1 byte
    yield ['a100', '\u0000'];
    // 2 byte
    yield ['a2c3bf', '\u00ff'];
    yield ['a2dfbf', '\u07ff'];
    yield ['a2d78a', '\u05Ca'];
    yield ['a2ceb1', 'α'];
    // 3 byte
    yield ['a3e0a080', '\u0800'];
    yield ['a3e28187', '\u2047'];
    yield ['a3e299a5', '\u2665'];
    yield ['a3e2b0bc', '\u2c3c'];
    yield ['a3e9a699', '\u9999'];
    yield ['a3efbfbf', '\uffff'];
    // 4 byte
    yield ['a4c4803030', '\u010000'];
    yield ['a4e183bf66', '\u10fff'];
    yield ['a4e1b4b036', '\u1d306'];
  }

  static* bin() {
    // 8 c4
    yield [mp.bin(0), js.bin(0)];
    yield [mp.bin(32), js.bin(32)];
    yield [mp.bin(255), js.bin(255)];
    // 16 c5
    yield [mp.bin(256), js.bin(256)];
    yield [mp.bin(65535), js.bin(65535)];
    // 32 c6
    yield [mp.bin(65536), js.bin(65536)];
  }

  static* array() {
    // fixarray 90 - 9f
    yield [mp.arr(0), js.arr(0)];
    yield [mp.arr(15), js.arr(15)];
    // 16 dc
    yield [mp.arr(16), js.arr(16)];
    yield [mp.arr(65535), js.arr(65535)];
    // 32 dd
    yield [mp.arr(65536), js.arr(65536)];
  }

  static* object() {
    // fixmap 80 - 8f
    yield [mp.map(0), js.obj(0)];
    yield [mp.map(15), js.obj(15)];
    // 16 de
    yield [mp.map(16), js.obj(16)];
    yield [mp.map(65535), js.obj(65535)];
    // 32 df
    yield [mp.map(65536), js.obj(65536)];
  }

  static* map() {
    // fixmap 80 - 8f
    yield [mp.map(0), js.map(0)];
    yield [mp.map(15), js.map(15)];
    // 16 de
    yield [mp.map(16), js.map(16)];
    yield [mp.map(65535), js.map(65535)];
    // 32 df
    yield [mp.map(65536), js.map(65536)];
  }

  static* ext() {
    // fixext 1/2/4/8/16
    yield [mp.ext(1, 1), js.ext(1, 1)];
    yield [mp.ext(1, 2), js.ext(1, 2)];
    yield [mp.ext(1, 4), js.ext(1, 4)];
    yield [mp.ext(1, 8), js.ext(1, 8)];
    yield [mp.ext(1, 16), js.ext(1, 16)];
    // 8
    yield [mp.ext(1, 255), js.ext(1, 255)];
    // 16
    yield [mp.ext(1, 256), js.ext(1, 256)];
    yield [mp.ext(1, 65535), js.ext(1, 65535)];
    // 32
    yield [mp.ext(1, 65536), js.ext(1, 65536)];
  }
}

module.exports = DataType;

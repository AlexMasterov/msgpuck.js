'use strict';

const {
  makePackArr,
  makePackObj,
  makePackUtf8,
  packAny,
  packAscii,
  packBigInt,
  packBigUint,
  packBuf,
  packFloat64,
  packFloat32,
  packInt,
  packUint,
} = require('./packs');

const Bool = 'boolean';
const Num = 'number';
const Obj = 'object';
const Str = 'string';
const BigNum = 'bigint';

class Packer {
  constructor({
    isArr=Array.isArray,
    isBuf=Buffer.isBuffer,
    objKeys=Object.keys,
    toAny=packAny,
    toInt=packInt,
    toUint=packUint,
    toFloat=packFloat32,
    toStr=makePackUtf8(),
    toBin=packBuf,
    toBigInt=packBigInt,
    toBigUint=packBigUint,
    toArr=makePackArr,
    toObj=makePackObj,
    codecs,
  } = {}) {
    this.pack = this.pack.bind(this);
    this.isBuf = isBuf;
    this.isArr = isArr;
    this.toAny = toAny;
    this.toInt = toInt;
    this.toBigInt = toBigInt;
    this.toBigUint = toBigUint;
    this.toUint = toUint;
    this.toFloat = toFloat;
    this.toStr = toStr;
    this.toBin = toBin;
    this.toArr = makePackArr(this.pack);
    this.toObj = makePackObj(this.pack, packAscii, objKeys);
    this.codecs = codecs;
  }

  pack(value) {
    switch (typeof value) {
      case Str:
        return this.toStr(value);
      case Num:
        return (value % 1 === 0)
          ? (value < 0)
            ? this.toInt(value)
            : this.toUint(value)
          : this.toFloat(value);
      case Obj:
        if (value === null) return '\xc0';
        if (this.isArr(value)) return this.toArr(value);
        if (this.isBuf(value)) return this.toBin(value);
        if (this.codecs !== void 0) {
          let i = this.codecs.length, bin;
          while (i > 0) {
            bin = this.codecs[i -= 1].pack(value, this);
            if (bin !== null) return bin;
          }
        }
        return this.toObj(value);
      case Bool:
        return value ? '\xc3' : '\xc2';
      case BigNum:
        if (value > 0xffffffff) return this.toBigUint(value);
        if (value < -0x80000000) return this.toBigInt(value);
        value = Number(value);
        return (value < 0)
          ? this.toInt(value)
          : this.toUint(value);

      default:
        return this.toAny(value);
    }
  }
}

module.exports = Packer;

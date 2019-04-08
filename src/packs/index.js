'use strict';

module.exports = class Packs {
  static get packBigInt() { return require('./packBigInt'); }
  static get packBigUint() { return require('./packBigUint'); }
  static get packBool() { return require('./packBool'); }
  static get packBuf() { return require('./packBuf'); }
  static get packExt() { return require('./packExt'); }
  static get packFloat() { return require('./packFloat'); }
  static get packFloat32() { return require('./packFloat32'); }
  static get packFloat64() { return require('./packFloat64'); }
  static get packInt() { return require('./packInt'); }
  static get packNil() { return require('./packNil'); }
  static get packUint() { return require('./packUint'); }
  // util
  static get packAny() { return require('./packAny'); }
  static get packAscii() { return require('./packAscii'); }
  static get packMapHead() { return require('./packMapHead'); }
  // factories
  static get makePackArr() { return require('./makePackArr'); }
  static get makePackObj() { return require('./makePackObj'); }
  static get makePackUtf8() { return require('./makePackUtf8'); }
};

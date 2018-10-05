exports.toFloat = require('./ieee754').toFloat;
exports.toDouble = require('./ieee754').toDouble;
exports.utf8toBin = require('./utf8').utf8toBin;
exports.bufToUtf8 = require('./utf8').bufToUtf8;
exports.bufToBin = require('./binary');

exports.FastBuffer = Buffer[Symbol.species];

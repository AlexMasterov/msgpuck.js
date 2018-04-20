function toFloat(x) {
  const frac = x & 0x7fffff;
  const expt = x >> 23 & 0xff;
  const sign = x >> 31 === 0 ? 1 : -1;

  if (expt === 0) {
    return frac === 0
      ? sign * 0
      : sign * frac * 2 ** -149;
  }
  if (expt === 0xff) {
    return frac === 0
      ? sign * Infinity
      : NaN;
  }

  return (sign << expt - 127) * (1 + frac * 2 ** -23);
}

function toDouble(x, y) {
  const frac = x + 0x100000000 * (y & 0xfffff);
  const expt = y >> 20 & 0x7ff;
  const sign = y >> 31 === 0 ? 1 : -1;

  if (expt === 0) {
    return frac === 0
      ? sign * 0
      : sign * frac * 2 ** -1074;
  }
  if (expt === 0x7ff) {
    return frac === 0
      ? sign * Infinity
      : NaN;
  }

  return (sign << expt - 1023) * (1 + frac * 2 ** -52);
}

exports.toFloat = toFloat;
exports.toDouble = toDouble;

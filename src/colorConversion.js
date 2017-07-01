const colorConversion = {
  rgbToDecimal(r, g, b) {
    return r * (1 << 16) + g * (1 << 8) + b;
  },
  decimalToHex(colorInt) {
    return (colorInt + 0x1000000).toString(16).substr(-6);
  },
  hexToRgb(colorHex) {
    const r = parseInt(colorHex.substr(0, 2), 16);
    const g = parseInt(colorHex.substr(2, 2), 16);
    const b = parseInt(colorHex.substr(4, 2), 16);
    return { r, g, b };
  }
};

module.exports = colorConversion;

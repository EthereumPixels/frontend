// @flow

export default {
  rgbToDecimal(r: number, g: number, b: number): number {
    return r * (1 << 16) + g * (1 << 8) + b;
  },
  decimalToHex(colorInt: number): string {
    return (colorInt + 0x1000000).toString(16).substr(-6);
  },
  hexToRgb(colorHex: string): { r: number, g: number, b: number } {
    const r = parseInt(colorHex.substr(0, 2), 16);
    const g = parseInt(colorHex.substr(2, 2), 16);
    const b = parseInt(colorHex.substr(4, 2), 16);
    return { r, g, b };
  }
}

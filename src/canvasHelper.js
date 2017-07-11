// @flow

const canvasHelper = {
  fillWhite(canvas: HTMLCanvasElement): void {
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas is broken');
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  },

  fillCheckered(canvas: HTMLCanvasElement): void {
    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error('Canvas is broken');
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#f4f4f4';

    const nRow = 250;
    const nCol = 250;

    const w = width / nCol;
    const h = height / nRow;

    for (let i = 0; i < nRow; ++i) {
        for (let j = 0, col = nCol / 2; j < col; ++j) {
            ctx.rect(2 * j * w + (i % 2 ? 0 : w), i * h, w, h);
        }
    }

    ctx.fill();
  },
};

export default canvasHelper

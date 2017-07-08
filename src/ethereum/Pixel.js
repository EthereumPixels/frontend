// @flow

export type Pixel = {
  color?: string, // hex
  message?: string,
  ownedByViewer?: boolean,
  owner?: string,
  price?: number,
  x: number, // col
  y: number, // row
};

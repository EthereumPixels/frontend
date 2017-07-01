// @flow

const Grid = require('../ethereum/Grid.json');
const getPixels = require('get-pixels');
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

const colorConversion = require('../colorConversion');

const { CONTRACT_ADDRESS, GRID_SIZE } = require('../configs');

const contract = web3.eth.contract(Grid.abi).at(CONTRACT_ADDRESS);

function drawImage(cornerX, cornerY, pixels) {
  const [frames, width, height, dimensions] = pixels.shape.slice();

  console.log(`Image size: ${width} x ${height}`);
  // console.log(pixels.get(0, 300, 300, 1));

  let count = 0;
  for (let x = 118; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const targetRow = cornerY + y;
      const targetCol = cornerX + x;
      if (targetCol >= GRID_SIZE || targetRow >= GRID_SIZE) {
        continue;
      }

      const a = pixels.get(0, x, y, 3);
      if (a === 0) {
        continue;
      }

      const r = pixels.get(0, x, y, 0);
      const g = pixels.get(0, x, y, 1);
      const b = pixels.get(0, x, y, 2);
      const color = colorConversion.rgbToDecimal(r, g, b);

      count += 1;
      const transaction = contract.setPixelColor(
        targetRow, targetCol, color,
        { from: web3.eth.accounts[0] },
      );
      // const transaction = 'test';

      console.log(count, `rgb(${r}, ${g}, ${b}) at (x = ${x}, y = ${y}) - ${transaction}`);
    }
  }
}

getPixels('/Users/darkmirage/pikachu.gif', function(err, pixels) {
  if (err) {
    console.log('Bad image path');
    return
  }
  drawImage(400, 300, pixels);
  // const color = contract.getPixelColor(100, 100);
});

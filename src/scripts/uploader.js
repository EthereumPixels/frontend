// @flow

const Grid = require('../ethereum/Grid.json');
const Jimp = require('jimp');
const Web3 = require('web3');
const parseArgs = require('minimist');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

const colorConversion = require('../colorConversion');

const { CONTRACT_ADDRESS, GRID_SIZE } = require('../configs');

const contract = web3.eth.contract(Grid.abi).at(CONTRACT_ADDRESS);

function drawImage(image, cornerX, cornerY, skip) {
  const { data, height, width } = image.bitmap;
  let count = 0;
  image.scan(0, 0, width, height, function(x, y, idx) {
    const targetRow = cornerY + y;
    const targetCol = cornerX + x;
    if (targetCol >= GRID_SIZE || targetRow >= GRID_SIZE) {
      return;
    }

    const a = data[idx + 3];
    if (a === 0) {
      return;
    }

    count += 1;
    if (count <= skip) {
      return;
    }

    const r = data[idx + 0];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const color = colorConversion.rgbToDecimal(r, g, b);

    const transaction = contract.setPixelColor(
      targetRow, targetCol, color, { from: web3.eth.coinbase },
    );

    console.log([
      count,
      `Txn ${transaction}`,
      `rgb(${r}, ${g}, ${b}) at (${targetCol}, ${targetRow})`,
    ].join(' - '));
  });
}

function run() {
  const args = parseArgs(process.argv.slice(2), {
    default: {
      x: 460,
      y: 480,
      skip: 0,
    },
  });
  Jimp.read(args._[0], function(err, image) {
    if (err) {
      console.log('Bad image path');
      return
    }
    drawImage(image, args.x, args.y, args.skip);
  });
}

run();

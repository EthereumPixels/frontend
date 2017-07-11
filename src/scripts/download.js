// @flow

const Grid = require('../ethereum/Grid.json');
const Jimp = require('jimp');
const Web3 = require('web3');
const path = require('path');
const parseArgs = require('minimist');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

const colorConversion = require('../colorConversion');

const { CONTRACT_ADDRESS, DEPLOYED_BLOCK, GRID_SIZE } = require('../configs');

const contract = web3.eth.contract(Grid.abi).at(CONTRACT_ADDRESS);

function loadImage(path) {
  return new Promise(function(resolve, reject) {
    if (!path) {
      resolve(new Jimp(GRID_SIZE, GRID_SIZE));
    } else {
      Jimp.read(path).then(function(image) {
        resolve(image);
      });
    }
  });
}

function processPixel(image, log) {
  if (log.event !== 'PixelColor') {
    return;
  }

  const { row, col, color, owner } = log.args;
  if (color.equals(0)) {
    return;
  }

  const colorInt = parseInt(color.valueOf(), 10);
  const colorIntWithAlpha = colorInt * 256 + 255;
  image.setPixelColor(colorIntWithAlpha, parseInt(col, 10), parseInt(row, 10));
};

function updateImage(image, blockNumber) {
  const events = contract.allEvents({
    fromBlock: blockNumber,
    toBlock: "latest",
  });

  return new Promise(function(resolve, reject) {
    events.get(function(error, logs) {
      if (error) {
        reject(error);
      }

      logs.forEach(function(log) {
        processPixel(image, log);
      });

      const lastBlock = logs[logs.length - 1].blockNumber;
      resolve({ image, blockNumber: lastBlock });
    });
  });
}

function run() {
  const args = parseArgs(process.argv.slice(2), {
    default: {
      output: '.',
      input: null,
      block: DEPLOYED_BLOCK,
    },
  });

  const cachedImagePath = args.input;
  const cachedImageBlock = args.block;
  const outputPath = args.output;

  loadImage(cachedImagePath).then(function(image) {
    return updateImage(image, cachedImageBlock);
  }).then(function({ image, blockNumber }) {
    const saveImagePath = path.resolve(
      path.join(outputPath, `${blockNumber}.png`),
    );
    image.write(saveImagePath);
    console.log(`Image saved to ${saveImagePath}`);
  });
}

run();

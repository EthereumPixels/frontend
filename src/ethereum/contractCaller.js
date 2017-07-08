// @flow

import type { Pixel } from './Pixel'

import Web3 from 'web3'
import Grid from './Grid.json'
import colorConversion from '../colorConversion'
import store from '../store'

import { GRID_SIZE, CONTRACT_ADDRESS } from '../configs'

class ContractCaller {
  web3: ?Web3;
  contract: ?Object;
  timerID: ?number;

  init() {
    const web3 = new Web3();
    if (window.web3) {
      web3.setProvider(window.web3.currentProvider);
    } else {
      web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
    }

    const contract = web3.eth.contract(Grid.abi).at(CONTRACT_ADDRESS);

    web3.version.getNetwork((err, netId) => {
      switch (netId) {
        case '1':
          console.log('Network: Mainnet');
          break;
        case '2':
          console.log('Network: Morden Testnet');
          break;
        case '3':
          console.log('Network: Ropsten Testnet');
          break;
        case '4':
          console.log('Network: Rinkeby Testnet');
          break;
        default:
          console.log('Network: Unknown');
      }
    });

    window.contract = contract;
    this.contract = contract;
    this.web3 = web3;
    this.timerID = null;
  }

  loadPixels(): void {
    const { contract } = this;
    if (!contract) {
      return;
    }
    const events = contract.allEvents({
      fromBlock: 412133,
      toBlock: "latest",
    });
    events.watch(function(err, log) {
      if (err) {
        return;
      }

      switch(log.event) {
        case 'PixelTransfer':
        case 'PixelPrice':
          break;
        case 'PixelColor':
          const { row, col, color, owner } = log.args;
          const colorInt = parseInt(color.valueOf(), 10);
          const colorHex = colorConversion.decimalToHex(colorInt);
          const pixel: Pixel = { x: col, y: row, color: colorHex, owner };
          store.dispatch({ type: 'PIXEL_COLOR', pixel });
          break;
        case 'PixelMessage':
          break;
        default:
          break;
      }
    });
  }

  getAccounts(): Array<?string> {
    return this.web3 ? this.web3.eth.accounts : [];
  }

  getUserMessage(pixel: Pixel): Promise<Pixel> {
    return new Promise((resolve, reject) => {
      if (!this.contract) {
        return reject('Contract is not initialized');
      }
      this.contract.getUserMessage(pixel.owner, (err, message) => {
        if (err) {
          return reject(err);
        }
        const newPixel = { ...pixel, message };
        resolve(newPixel);
      });
    });
  }

  getPixelColor(pixel: Pixel): Promise<Pixel> {
    return new Promise((resolve, reject) => {
      if (!this.contract) {
        return reject('Contract is not initialized');
      }
      this.contract.getPixelColor(pixel.y, pixel.x, (err, colorBigNum) => {
        if (err) {
          return reject(err);
        }
        if (!colorBigNum) {
          return reject('Color is null');
        }
        const colorInt = parseInt(colorBigNum.valueOf(), 10);
        const color = colorConversion.decimalToHex(colorInt);
        const newPixel = { ...pixel, color };
        resolve(newPixel);
      });
    });
  }

  getPixelPrice(pixel: Pixel): Promise<Pixel> {
    return new Promise((resolve, reject) => {
      if (!this.contract) {
        return reject('Contract is not initialized');
      }
      this.contract.getPixelPrice(pixel.y, pixel.x, (err, price) => {
        if (err) {
          return reject(err);
        }
        if (!price) {
          return reject('Price is null');
        }
        const newPixel = { ...pixel, price: parseInt(price.valueOf(), 10) };
        resolve(newPixel);
      })
    });
  }

  getPixelOwner(pixel: Pixel): Promise<Pixel> {
    return new Promise((resolve, reject) => {
      if (!this.contract) {
        return reject('Contract is not initialized');
      }
      this.contract.getPixelOwner(pixel.y, pixel.x, (err, owner) => {
        if (err) {
          return reject(err);
        }
        const newPixel = { ...pixel, owner };
        resolve(newPixel)
      });
    });
  }

  selectPixel(pixel: Pixel): void {
    if (pixel.x < 0 || pixel.y < 0 || pixel.x >= GRID_SIZE || pixel.y >= GRID_SIZE) {
      return;
    }
    const caller = this;
    if (this.timerID) {
      window.clearTimeout(this.timerID);
    }
    window.setTimeout(function() {
      caller.getPixelColor(pixel).then(function(pixel) {
        return caller.getPixelOwner(pixel);
      }).then(function(pixel) {
        return caller.getPixelPrice(pixel);
      }).then(function(pixel) {
        return caller.getUserMessage(pixel);
      }).then(function(pixel) {
        const owned = caller.getAccounts().includes(pixel.owner);
        pixel.ownedByViewer = owned;
        store.dispatch({ type: 'PIXEL_SELECT', pixel });
        caller.timerID = null;
      });
    }, 200);
  }
}

export default new ContractCaller()

// @flow

import type { Pixel } from './Pixel'

import Web3 from 'web3'
import Grid from './Grid.json'
import colorConversion from '../colorConversion'
import notifier from '../notifier'
import store from '../store'

import { GRID_SIZE, CONTRACT_ADDRESS } from '../configs'

class ContractCaller {
  connected: boolean;
  contract: Object;
  events: Object;
  timerID: ?number;
  web3: Web3;

  init() {
    const web3 = new Web3();
    if (window.web3) {
      web3.setProvider(window.web3.currentProvider);
    } else {
      web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
    }

    const contract = web3.eth.contract(Grid.abi).at(CONTRACT_ADDRESS);
    if (!contract) {
      throw new Error('Invalid contract ABI');
    }

    this.events = contract.allEvents({
      fromBlock: 412133,
      toBlock: "latest",
    });

    window.contract = contract; // for debugging
    this.connected = false;
    this.contract = contract;
    this.web3 = web3;
    this.timerID = null;

    this.pollForConnection();
  }

  _doOnFailedConnection(): void {
    this.connected = false;
    notifier.disconnected();
    store.dispatch({ type: 'SET_CONNECTION', connected: false });
    this.events.stopWatching();
  }

  _doOnSuccessfulConnection(): void {
    this.connected = true;
    notifier.connected();
    store.dispatch({ type: 'SET_CONNECTION', connected: true });
    this.printNetwork();

    // MetaMask needs this to work or web3.eth.accounts will be empty
    window.setTimeout(() => this.fetchUsers(), 100);

    this.events.watch(this._handleContractEvent);
  }

  _handleContractEvent = (err: Object, log: Object) => {
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

        // If the updated pixel is the currently selected pixel, force a
        // refetch to update the sidebar information
        const selectedPixel = store.getState().get('selectedPixel');
        if (selectedPixel && selectedPixel.x === col && selectedPixel.y === col) {
          this.selectPixel(pixel);
        }
        break;
      case 'PixelMessage':
        break;
      default:
        break;
    }
  };

  pollForConnection(): void {
    const { web3 } = this;

    // This is check is usually sufficient for MetaMask
    if (web3.isConnected()) {
      this._doOnSuccessfulConnection();
    } else {
      this._doOnFailedConnection();
    }

    let tries = 0;

    // Mist Wallet needs this polling to work. For some reason it initially
    // returns false for web3.isConnected()
    const interval = window.setInterval(() => {
      if (web3.isConnected() && !this.connected) {
        window.clearInterval(interval);
        return this._doOnSuccessfulConnection();
      } else if (!web3.isConnected() && this.connected) {
        window.clearInterval(interval);
        return this._doOnFailedConnection();
      }
      tries += 1;
      if (tries > 10) {
        // Stop polling for changes after some attempts
        window.clearInterval(interval);
      }
    }, 200);
  }

  printNetwork(): void {
    this.web3.version.getNetwork((err, netId) => {
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
        let color = colorConversion.decimalToHex(colorInt);
        if (color === '000000') {
          color = 'transparent';
        }
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

  // Janky hack to synchronize fetching all user data
  fetchUsers(): void {
    const users = [];
    let waiting = this.web3.eth.accounts.length * 2;
    const checkDone = () => {
      waiting -= 1;
      if (waiting > 0) {
        return;
      }
      store.dispatch({ type: 'SET_USERS', users });
    };

    this.web3.eth.accounts.forEach((address, i): void => {
      users[i] = { address };
      this.contract.getUserMessage(address, function(err, message: string) {
        if (!err) {
          users[i].message = message;
        }
        checkDone();
      });

      this.contract.checkPendingWithdrawal(
        { from: address },
        function(err, balance) {
          if (!err) {
            users[i].balance = parseInt(balance.valueOf(), 10);
          }
          checkDone();
        },
      );
    });
  }

  setUserMessage(address: string, message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.contract.setUserMessage(
        message,
        { from: address },
        (err, transactionHash) => {
          if (err) {
            return reject(err);
          }
          resolve(transactionHash);
        },
      );
    });
  }

  withdraw(address: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.contract.withdraw({ from: address }, (err, transactionHash) => {
        if (err) {
          return reject(err);
        }
        resolve(transactionHash);
      });
    });
  }

  selectPixel(pixel: Pixel): void {
    if (pixel.x < 0 || pixel.y < 0 || pixel.x >= GRID_SIZE || pixel.y >= GRID_SIZE) {
      return;
    }

    if (!this.connected) {
      store.dispatch({ type: 'PIXEL_SELECT', pixel });
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

  setPixel(pixel: Pixel, colorHex: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const user = pixel.ownedByViewer ? pixel.owner : this.web3.eth.coinbase;
      if (!user) {
        return reject('Invalid user');
      }

      const callback = (err, transactionHash) => {
        if (err) {
          return reject(err);
        }
        resolve(transactionHash);
      };

      const { x, y, price } = pixel;
      if (typeof x !== 'number' || typeof y !== 'number' || typeof price !== 'number') {
        throw new Error('Unexpected inputs');
      }

      if (pixel.ownedByViewer) {
        this.contract.setPixelColor(
          y,
          x,
          parseInt(colorHex, 16),
          { from: user },
          callback,
        );
      } else {
        this.contract.buyPixel(
          y,
          x,
          price * 2,
          parseInt(colorHex, 16),
          { from: user, value: price },
          callback,
        );
      }
    });
  }
}

export default new ContractCaller()

// @flow

import React from 'react'

import store from './store'

import { ETHERSCAN_URL } from './configs'

function getLink(transactionHash: string): React.Element<*> {
  return (
    <a
      className="transactionLink"
      rel="noopener noreferrer"
      target="_blank"
      href={`${ETHERSCAN_URL}/tx/${transactionHash}`}>
      {transactionHash}
    </a>
  );
}

class Notifier {
  counter: number;

  constructor() {
    this.counter = 0;
  }

  add(
    message: React.Element<*> | Node | string,
    permanent?: boolean,
    overrideKey? : string,
  ) {
    const { counter } = this;
    const key = overrideKey || counter;

    const notification = {
      action: permanent ? 'Dismiss' : null,
      dismissAfter: permanent ? false : 10000,
      key,
      message: message,
      style: false,
      onClick: () => store.dispatch({
        type: 'REMOVE_NOTIFICATION',
        notification: { key },
      }),
    };

    store.dispatch({ type: 'ADD_NOTIFICATION', notification });
    this.counter += 1;
  }

  remove(notification: Object) {
    store.dispatch({ type: 'REMOVE_NOTIFICATION', notification });
  }

  connected() {
    this.remove({ key: 'disconnected' });
    this.add('Connected to Ethereum network');
  }

  disconnected() {
    this.remove({ key: 'disconnected' });
    this.add('Not connected to Ethereum network', true, 'disconnected');
  }

  transactionSubmitted(transactionHash: string): void {
    this.add(
      <div>
        Transaction: {getLink(transactionHash)}
        <br/>
        Image will update when the blockchain confirms it
      </div>
    );
  }

  withdrawalSubmitted(transactionHash: string): void {
    this.add(
      <div>
        Transaction: {getLink(transactionHash)}
        <br/>
        Withdrawal request submitted
      </div>
    );
  }

  messageSubmitted(transactionHash: string): void {
    this.add(
      <div>
        Transaction: {getLink(transactionHash)}
        <br/>
        Message will update when the blockchain confirms it
      </div>
    );
  }

  pixelUpdated(x: number, y: number, colorHex: string): void {
    const color = colorHex === '000000' ? 'transparent' : `#${colorHex}`;
    this.add(
      <div>
        <a
          className="transactionLink"
          onClick={() => {
            store.dispatch({ type: 'PIXEL_SELECT', pixel: { x, y } });
            store.dispatch({ type: 'MOVE_TO', centerX: x, centerY: y });
          }}
        >
          ({x}, {y})
        </a>
        {' is now '}
        <span title={color}
          className="notificiation-color-box"
          style={{ background: `#${colorHex}` }}
        >
          <span>{color}</span>
        </span>
      </div>
    );
  }
}

const notifier = new Notifier();
window.notifier = notifier;

export default notifier;

// @flow

import React from 'react'

import store from './store'

function getLink(transactionHash: string): React.Element<*> {
  return (
    <a
      className="transactionLink"
      rel="noopener noreferrer"
      target="_blank"
      href={`https://rinkeby.etherscan.io/tx/${transactionHash}`}>
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
      dismissAfter: permanent ? false : 6000,
      key,
      message: message,
      style: false,
      onClick: () => this.remove({ key }),
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
}

const notifier = new Notifier();
window.notifier = notifier;

export default notifier;

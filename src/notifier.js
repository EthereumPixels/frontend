// @flow

import store from './store'

class Notifier {
  counter: number;

  constructor() {
    this.counter = 0;
  }

  add(message: React.Element<*> | Node | string, permanent?: boolean) {
    const { counter } = this;

    const notification = {
      action: permanent ? 'Dismiss' : null,
      dismissAfter: permanent ? false : 6000,
      key: counter,
      message: message,
      style: false,
      onClick: () => this.remove({ key: counter }),
    };

    store.dispatch({ type: 'ADD_NOTIFICATION', notification });
    this.counter += 1;
  }

  remove(notification: Object) {
    store.dispatch({ type: 'REMOVE_NOTIFICATION', notification });
  }
}

export default new Notifier()

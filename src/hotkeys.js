// @flow

import keycode from 'keycode'
import store from './store'

class HotKeys {
  mouseDown: boolean;
  constructor() {
    this.mouseDown = false;
  }

  handleKey(event: KeyboardEvent): void {
    switch(keycode(event)) {
      case '-':
        store.dispatch({ type: 'ZOOM_OUT' });
        break;
      case '=':
        store.dispatch({ type: 'ZOOM_IN' });
        break;
      case 'left':
        store.dispatch({ type: 'MOVE', dx: -10, dy: 0 });
        break;
      case 'right':
        store.dispatch({ type: 'MOVE', dx: 10, dy: 0 });
        break;
      case 'up':
        store.dispatch({ type: 'MOVE', dx: 0, dy: -10 });
        break;
      case 'down':
        store.dispatch({ type: 'MOVE', dx: 0, dy: 10 });
        break;
      case 'esc':
        store.dispatch({ type: 'NAVIGATE_SIDEBAR', sidebar: null });
        break;
      default:
        break;
    }
  }

  enable() {
    window.onkeyup = this.handleKey;
  }

  disable() {
    window.onkeyup = null;
  }
}

export default new HotKeys()

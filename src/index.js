import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { Provider } from 'react-redux'

import contractCaller from './ethereum/contractCaller'
import registerServiceWorker from './registerServiceWorker'
import hotkeys from './hotkeys'
import store from './store'

import './css/index.css'

window.caller = contractCaller;

window.addEventListener('load', () => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
  hotkeys.enable();
  contractCaller.init();
});

registerServiceWorker();

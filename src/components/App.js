// @flow

import React, { Component } from 'react'
import GridContainer from '../containers/GridContainer'
import SidebarContainer from '../containers/SidebarContainer'
import store from '../store'
import '../css/App.css'

class App extends Component {
  componentDidMount() {
    store.dispatch({ type: 'SET_HEADER', height: this.refs.header.offsetHeight});
  }

  render() {
    return (
      <div className="App">
        <div className="App-header" ref="header">
          <p className="title is-4">Pixels</p>
          <p className="subtitle is-6">
            The <a href="http://ethdocs.org/en/latest/introduction/web3.html">
              Web 3.0
            </a> Homepage
          </p>
        </div>
        <GridContainer />
        <SidebarContainer />
      </div>
    );
  }
}

export default App

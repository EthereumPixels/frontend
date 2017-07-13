// @flow

import React, { Component } from 'react'
import GridContainer from '../containers/GridContainer'
import NotificationsContainer from '../containers/NotificationsContainer'
import SidebarContainer from '../containers/SidebarContainer'
import ZoomBarContainer from '../containers/ZoomBarContainer'

import '../css/App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img alt="Ethereum Pixels" className="App-logo" src="/img/logo.png" />
          Ethereum Pixels
        </div>
        <GridContainer />
        <NotificationsContainer />
        <SidebarContainer />
        <ZoomBarContainer />
      </div>
    );
  }
}

export default App

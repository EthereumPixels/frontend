// @flow

import type { Pixel } from '../ethereum/Pixel'
import type { User } from '../ethereum/User'

import Navigation from './Navigation'
import React, { Component } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types'
import SidebarPixelTab from './SidebarPixelTab'
import SidebarSimpleTab from './SidebarSimpleTab'
import SidebarUsersTab from './SidebarUsersTab'

import '../css/Sidebar.css'

type Props = {
  connected: boolean,
  hoverPixel: ?Pixel,
  selectedPixel: ?Pixel,
  selectedSidebar: ?string,
  users: Array<User>,
};

class Sidebar extends Component<void, Props, void> {
  _renderDisconnected(): React.Element<*> {
    return (
      <SidebarSimpleTab>
        <h4>Not connected</h4>
        <p>
          In order to interact with this distributed application (DApp) powered
          by the main Ethereum blockchain, you need to use {' '}
          <a
            href="https://metamask.io/"
            rel="noopener noreferrer"
            target="_blank"
          >
            MetaMask
          </a>, the {' '}
          <a
            href="https://github.com/ethereum/mist/releases"
            rel="noopener noreferrer"
            target="_blank"
          >
            Mist browser
          </a>, or some other web3.js-enabled browser.
        </p>
        <p>
          This DApp will also attempt to connect to {' '}
          <code>http://localhost:8545</code> if an RPC service is available
          through <code>geth</code> or other clients, but you should manually
          unlock your wallet if you want to perform any actions.
        </p>
      </SidebarSimpleTab>
    );
  }

  render() {
    const { connected, selectedPixel, selectedSidebar } = this.props;

    let content = null;
    switch (selectedSidebar) {
      case 'pixel':
        content = <SidebarPixelTab {...this.props} />;
        break;
      case 'user':
        content = connected
          ? <SidebarUsersTab users={this.props.users} />
          : this._renderDisconnected();
        break;
      case null:
        break;
      default:
        content = <SidebarSimpleTab>No content</SidebarSimpleTab>;
        break;
    }

    content = content ? <div className="Sidebar-content">{content}</div> : null;

    return (
      <div className="Sidebar" key="sidebar">
        <Navigation
          hasSelectedPixel={!!selectedPixel}
          selectedSidebar={selectedSidebar}
        />
        <ReactCSSTransitionGroup
          onMouseMove={(event) => event.stopPropagation()}
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}
          transitionName="Sidebar-slide"
        >
          {content}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

Sidebar.propTypes = {
  connected: PropTypes.bool.isRequired,
  hoverPixel: PropTypes.object,
  selectedPixel: PropTypes.object,
  selectedSidebar: PropTypes.string,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidebar

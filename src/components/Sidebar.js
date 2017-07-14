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

import { CONTRACT_ADDRESS, ETHERSCAN_URL } from '../configs'

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
          In order to interact with this DApp (distributed application) powered
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

  _renderFAQ(): React.Element<*> {
    return (
      <SidebarSimpleTab>
        <p className="Sidebar-question">
          What is Ethereum Pixels?
        </p>
        <p>
          It is a 1000x1000 grid of Pixels whose entire edit history is stored
          permanently in the <strong>Ethereum blockchain</strong>. The backend
          logic is powered by a public smart contract running on the
          main Ethereum network. It was originally inspired by Reddit's{' '}
          <a
            href="https://en.wikipedia.org/wiki/Place_(Reddit)"
            rel="noopener noreferrer"
            target="_blank"
          >
            r/place
          </a>.
        </p>

        <p className="Sidebar-question">
          How does it work?
        </p>
        <p>
          Every Pixel in the grid is owned by an Ethereum address and has a
          set <strong>price</strong> and <strong>color</strong>. The owner of a
          Pixel may change its color at any
          time. Other users may pay the listed price to purchase a Pixel from
          its owner and change its color. The payment is credited to the
          owner minus a small transaction fee. In addition to the web
          UI, the underlying smart contract can also be called programmatically
          to edit Pixels in bulk.
        </p>

        <p className="Sidebar-question">
          What are the controls?
        </p>
        <p>
          You can zoom and drag the canvas pretty much like Google Maps.
          Use the scroll wheel or trackpad to zoom in and out. Click
          on any Pixels to view and make changes.
        </p>

        <p className="Sidebar-question">
          How much does it cost?
        </p>
        <p>
          Every Pixel is initialized with a price of {' '}
          <strong>0.002 ETH</strong>. The list
          price is designed to automatically increase with every successful
          transaction at a steady <strong>25% rate</strong> of increase.
          In addition, every
          action incurs the standard Ethereum gas cost. You can look at
          some transactions on {' '}
          <a
            href={`${ETHERSCAN_URL}/address/${CONTRACT_ADDRESS}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Etherscan
          </a> to get a rough idea of the gas cost.
        </p>

        <p className="Sidebar-question">
          What is a user message and how do I set one?
        </p>
        <p>
          Every address is allowed to set a custom message that is displayed on
          all Pixels owned by that address. You can use this message for
          anything you want. Note that setting a really long message may require
          a large one-time gas cost. You can set your message in the
          <strong>User</strong> tab.
        </p>

        <p className="Sidebar-question">
          I just set the color of a Pixel. Why is it not showing up?
        </p>
        <p>
          The image displayed here is backed by the Ethereum blockchain and will
          update only when the blockchain has confirmed the transaction. You can
          visit the {' '}
          <a
            href={`${ETHERSCAN_URL}/address/${CONTRACT_ADDRESS}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Etherscan
          </a> report for the smart contract and look up the
          wallet address from which you made the transaction to see its status.
        </p>

        <p className="Sidebar-question">
          Someone just bought my Pixel. Where is my payment?
        </p>
        <p>
          Visit the <strong>User</strong> tab and you should see the amount of
          Ether that is
          credited to your address. Make sure that you are logged in using the
          same address that owned the Pixel. Once you verify the balance is
          there, click <strong>Withdraw</strong> and perform a withdrawal
          transaction in order to receive your entire balance.
        </p>
      </SidebarSimpleTab>
    );
  }

  _renderContact(): React.Element<*> {
    return (
      <SidebarSimpleTab>
        <h4>Contact me</h4>
        <p>
          Email: {' '}
          <a href="mailto:raven@cs.stanford.edu">raven@cs.stanford.edu</a><br />
          Blog: {' '}
          <a
            href="http://soraven.com"
            rel="noopener noreferrer"
            target="_blank"
          >soraven.com
          </a><br />
          ENS: nadesico.eth<br />
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
      case 'faq':
        content = this._renderFAQ();
        break;
      case 'contact':
        content = this._renderContact();
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

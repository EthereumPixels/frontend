// @flow

import type { User } from '../ethereum/User'

import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
} from 'react-bootstrap'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SidebarSimpleTab from './SidebarSimpleTab'
import contractCaller from '../ethereum/contractCaller'
import notifier from '../notifier'

import { ETHERSCAN_URL } from '../configs'

type Props = {
  users: Array<User>,
};

class SidebarUsersTab extends Component<void, Props, void> {
  props: Props;

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.users.length !== this.props.users.length;
  }

  render() {
    if (this.props.users.length === 0) {
      return (
        <SidebarSimpleTab>
          <h4>No connected accounts</h4>
          <p>
            Please connect at least one Ethereum account to view your user
            profile.
          </p>
        </SidebarSimpleTab>
      );
    }

    const users = this.props.users.map((user, i) => {
      const messageText = user.message;
      const priceText = `${contractCaller.web3.fromWei(user.balance, 'ether')} ETH`;
      const divider = i < this.props.users.length - 1
        ? <div className="Sidebar-row Sidebar-divider" />
        : null;

      const withdrawalButton = (
        <Button
          bsSize="xsmall"
          bsStyle="primary"
          disabled={user.balance === 0}
          onClick={() => {
            contractCaller.withdraw(user.address).then((hash) => {
              notifier.withdrawalSubmitted(hash);
            }).catch(function(error) {
              notifier.add('Withdrawal failed or was cancelled');
            });
          }}
        >
          Withdraw
        </Button>
      );

      const saveButton = (
        <Button
          bsSize="xsmall"
          bsStyle="primary"
          onClick={() => {
            const form = document.getElementById(user.address);
            console.log(typeof form);
            if (!(form instanceof HTMLTextAreaElement)) {
              return;
            }
            const message = form.value;
            contractCaller.setUserMessage(user.address, message).then((hash) => {
              notifier.messageSubmitted(hash);
            }).catch(function(error) {
              notifier.add('Failed to set message');
            });
          }}
          style={{ marginTop: 8 }}
        >
          Save Message
        </Button>
      );

      return (
        <div className="Sidebar-user-section" key={user.address}>
          <div>
            <div className="Sidebar-subheader">Balance</div>
            <div className="Sidebar-header">
              {priceText}
              {' '}
              {withdrawalButton}
            </div>
          </div>
          <div className="Sidebar-row">
            <div className="Sidebar-subheader">Address</div>
            <div className="Sidebar-address">
              <a
                href={`${ETHERSCAN_URL}/address/${user.address}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {user.address}
              </a>
            </div>
          </div>
          <div className="Sidebar-row">
            <div className="Sidebar-subheader">Message</div>
            <div>
              <FormGroup controlId={user.address}>
                <ControlLabel srOnly={true}>Textarea</ControlLabel>
                <FormControl
                  className="Sidebar-message"
                  componentClass="textarea"
                  placeholder="Not set"
                  rows={10}
                  defaultValue={messageText}
                />
                {saveButton}
                <div className="Sidebar-message-warning">
                  Long messages can cost more gas to save!
                </div>
              </FormGroup>
            </div>
          </div>
          {divider}
        </div>
      )
    })

    return (
      <SidebarSimpleTab>
        {users}
      </SidebarSimpleTab>
    );
  }
}

SidebarUsersTab.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SidebarUsersTab

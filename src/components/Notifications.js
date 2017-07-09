// @flow

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { NotificationStack } from 'react-notification'
import notifier from '../notifier'

import '../css/Notifications.css'

type Props = {
  notifications: Array<Object>,
};

class Notifications extends Component<void, Props, void> {
  props: Props;

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.notifications.length !== this.props.notifications.length;
  }

  _handleMouseMove(event: SyntheticMouseEvent) {
    event.stopPropagation();
  }

  _handleDismiss = (notification: Object): void => {
    notifier.remove(notification);
  };

  render() {
    return (
      <div className='Notifications' onMouseMove={this._handleMouseMove}>
        <NotificationStack
          notifications={this.props.notifications}
          onDismiss={this._handleDismiss}
        />
      </div>
    );
  }
}

Notifications.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Notifications

// @flow

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Clearfix, Glyphicon } from 'react-bootstrap'
import classNames from 'classnames'
import store from '../store'

import '../css/Navigation.css'

type Props = {
  hasSelectedPixel: boolean,
  selectedSidebar: ?string,
};

class Navigation extends Component<void, Props, void> {
  props: Props;

  _renderSidebarItem(sidebar: string): React.Element<*> {
    const { selectedSidebar } = this.props;
    const selected = selectedSidebar === sidebar;
    const className = classNames({
      'Navigation-item': true,
      'Navigation-item-active': selected,
    });
    const navigationTarget = selected ? null : sidebar;
    const handler = () => store.dispatch({
      type: 'NAVIGATE_SIDEBAR',
      sidebar: navigationTarget,
    });

    return (
      <li className={className} onClick={handler}>
        <Glyphicon className="Navigation-close" glyph="remove" />
        {sidebar}
      </li>
    );
  }

  _handleMouseMove(event: SyntheticMouseEvent) {
    event.stopPropagation();
  }

  render() {
    return (
      <Clearfix className="Navigation" onMouseMove={this._handleMouseMove}>
        <ul>
          {this._renderSidebarItem('pixel')}
          {this._renderSidebarItem('user')}
          {this._renderSidebarItem('faq')}
          {this._renderSidebarItem('contact')}
        </ul>
      </Clearfix>
    );
  }
}

Navigation.propTypes = {
  hasSelectedPixel: PropTypes.bool.isRequired,
  selectedSidebar: PropTypes.string,
};

export default Navigation

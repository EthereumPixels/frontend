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
  render() {
    const { selectedPixel, selectedSidebar } = this.props;

    let content = null;
    switch (selectedSidebar) {
      case 'pixel':
        content = <SidebarPixelTab {...this.props} />;
        break;
      case 'user':
        content = <SidebarUsersTab users={this.props.users} />;
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

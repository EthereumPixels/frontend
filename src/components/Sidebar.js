// @flow

import type { Pixel } from '../ethereum/Pixel'

import React, { Component } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PropTypes from 'prop-types'
import SidebarPixel from './SidebarPixel'

import '../css/Sidebar.css'

type Props = {
  selectedSidebar: string,
  hoverPixel: ?Pixel,
  selectedPixel: ?Pixel,
};

class Sidebar extends Component<void, Props, void> {
  render() {
    let content = null;
    switch (this.props.selectedSidebar) {
      case 'pixel':
        content = <SidebarPixel {...this.props} />;
        break;
      default:
        break;
    }

    const sidebar = content ? (
      <div className="Sidebar" key="sidebar">
        {content}
      </div>
    ) : null;

    return (
      <ReactCSSTransitionGroup
        onMouseMove={(event) => event.stopPropagation()}
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
        transitionName="Sidebar-slide"
      >
        {sidebar}
      </ReactCSSTransitionGroup>
    );
  }
}

Sidebar.propTypes = {
  hoverPixel: PropTypes.object,
  selectedPixel: PropTypes.object,
  selectedSidebar: PropTypes.string,
};

export default Sidebar

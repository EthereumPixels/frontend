// @flow

import type { Pixel } from '../ethereum/Pixel'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import contractCaller from '../ethereum/contractCaller'

import '../css/Sidebar.css'

export type Props = {
  hoverPixel: ?Pixel,
  selectedPixel: ?Pixel,
};

class Sidebar extends Component<void, Props, void> {
  render() {
    const { selectedPixel } = this.props;
    if (!selectedPixel) {
      return null;
    }

    const { owner } = selectedPixel;
    const ownerText = owner && contractCaller.getAccounts().includes(owner)
      ? <span>{owner} (You)</span>
      : owner;
    return (
      <div>
        <div>
          ({selectedPixel.x}, {selectedPixel.y})
        </div>
        <table className="table">
          <tbody>
            <tr><td>Color</td><td>{selectedPixel.color}</td></tr>
            <tr><td>Owner</td><td>{ownerText}</td></tr>
            <tr><td>Message</td></tr>
          </tbody>
        </table>
      </div>
    );
  }
}

Sidebar.propTypes = {
  hoverPixel: PropTypes.object,
  selectedPixel: PropTypes.object,
};

export default Sidebar

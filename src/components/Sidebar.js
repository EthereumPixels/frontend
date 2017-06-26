// @flow

import type { Pixel } from '../ethereum/Pixel'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import contractCaller from '../ethereum/contractCaller'

import '../css/Sidebar.css'

type Props = {
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
      <div className="Sidebar">
        <div className="box">
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
      </div>
    );
  }
}

Sidebar.propTypes = {
  selectedPixel: PropTypes.object,
};

export default Sidebar

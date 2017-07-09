// @flow

import type { Pixel } from '../ethereum/Pixel'

import { Col, Grid, Row } from 'react-bootstrap'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import '../css/Sidebar.css'

type Props = {
  selectedPixel: ?Pixel,
};

class SidebarPixel extends Component<void, Props, void> {
  props: Props;

  shouldComponentUpdate(nextProps: Props): boolean {
    const pixel = this.props.selectedPixel;
    const nextPixel = nextProps.selectedPixel;
    return !pixel || !nextPixel || nextPixel.x !== pixel.x || nextPixel.y !== pixel.y;
  }

  render() {
    const { selectedPixel } = this.props;
    if (!selectedPixel) {
      return;
    }

    const color = selectedPixel.color || '000000';
    const colorText = color === '000000' ? 'Transparent' : (
      <div>
        #{color}
        <div className="Sidebar-colorbox" style={{
          backgroundColor: `#${color}`,
        }}/>
      </div>
    );

    const owner = selectedPixel.owner || '';
    const ownerLink = (
      <a href={`https://rinkeby.etherscan.io/address/${owner}`}>
        {owner}
      </a>
    );
    const ownerText = selectedPixel.ownedByViewer
      ? <span><span className="Sidebar-you">You - </span>{ownerLink}</span>
      : ownerLink;
    const messageText = selectedPixel.message || 'Not set';
    const price = window.web3.fromWei(selectedPixel.price, 'ether');

    return (
      <Grid fluid={true}>
        <Row>
          <Col xs={7}>
            <div>
              <div className="Sidebar-subheader">Location</div>
              <div className="Sidebar-header">
                {selectedPixel.x}, {selectedPixel.y}
              </div>
            </div>
            <div className="Sidebar-row">
              <div className="Sidebar-subheader">Price</div>
              <div>{price} ETH</div>
            </div>
          </Col>
          <Col xs={5}>
            <div className="Sidebar-subheader">Color</div>
            <div>{colorText}</div>
          </Col>
        </Row>
        <Row className="Sidebar-row">
          <Col xs={12}>
            <div className="Sidebar-subheader">Owner</div>
            <div className="Sidebar-address">{ownerText}</div>
          </Col>
        </Row>
        <Row className="Sidebar-row">
          <Col xs={12}>
            <div className="Sidebar-subheader">Message</div>
            <div>{messageText}</div>
          </Col>
        </Row>
      </Grid>
    );
  }
}

SidebarPixel.propTypes = {
  selectedPixel: PropTypes.object,
};

export default SidebarPixel

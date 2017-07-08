// @flow

import type { Pixel } from '../ethereum/Pixel'

import { Col, Grid, Row } from 'react-bootstrap'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import '../css/Sidebar.css'

type Props = {
  hoverPixel: ?Pixel,
  selectedPixel: ?Pixel,
};

class Sidebar extends Component<void, Props, void> {
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
      <span>
        #{color}
        <span className="Sidebar-colorbox" style={{
          backgroundColor: `#${color}`,
        }}/>
      </span>
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

    const content = [
      <Row className="Sidebar-row" key="owner">
        <Col xs={12}>
          <div className="Sidebar-subheader">Owner</div>
          <div className="Sidebar-address">{ownerText}</div>
        </Col>
      </Row>,
      <Row className="Sidebar-row" key="message">
        <Col xs={12}>
          <div className="Sidebar-subheader">Message</div>
          <div>{messageText}</div>
        </Col>
      </Row>,
      <Row className="Sidebar-row" key="price">
        <Col xs={12}>
          <div className="Sidebar-subheader">Price</div>
          <div className="Sidebar-price">
            {window.web3.fromWei(selectedPixel.price, 'ether')} ETH
          </div>
        </Col>
      </Row>,
    ];

    const rightContent = (
      <Col xs={6}>
        <div className="Sidebar-subheader">Color</div>
        <div>{colorText}</div>
      </Col>
    );

    return (
      <Grid fluid={true}>
        <Row>
          <Col xs={6}>
            <div className="Sidebar-subheader">Location</div>
            <div className="Sidebar-header">
              {selectedPixel.x}, {selectedPixel.y}
            </div>
          </Col>
          {rightContent}
        </Row>
        {content}
      </Grid>
    );
  }
}

Sidebar.propTypes = {
  hoverPixel: PropTypes.object,
  selectedPixel: PropTypes.object,
};

export default Sidebar

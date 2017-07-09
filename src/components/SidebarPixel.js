// @flow

import type { Pixel } from '../ethereum/Pixel'

import {
  Button,
  ButtonToolbar,
  Col,
  Grid,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap'
import ColorPicker from './ColorPicker'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import '../css/Sidebar.css'

type Props = {
  selectedPixel: ?Pixel,
};

type State = {
  color: ?string,
  colorPickerExpanded: boolean,
};

function samePixel(a, b) {
  return a && b && a.x === b.x && a.y === b.y;
}

class SidebarPixel extends Component<void, Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      color: null,
      colorPickerExpanded: false,
    };
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (!samePixel(this.props.selectedPixel, nextProps.selectedPixel)) {
      this.setState({ color: null, colorPickerExpanded: false });
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    if (
      this.state.color !== nextState.color ||
      this.state.colorPickerExpanded !== nextState.colorPickerExpanded
    ) {
      return true;
    }
    return !samePixel(this.props.selectedPixel, nextProps.selectedPixel);
  }

  _handleColorChange = ({ hex }: { hex: string }) => {
    const color = hex[0] === '#' ? hex.substr(1) : hex;
    this.setState({ color });
  };

  render() {
    const { selectedPixel } = this.props;
    if (!selectedPixel) {
      return;
    }

    const color = this.state.color || selectedPixel.color;
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

    const buyTooltip = (
      <Tooltip id="buyTooltip">
        Set the color by paying the listed price.
        You will own the pixel
      </Tooltip>
    );

    return (
      <Grid fluid={true}>
        <Row>
          <Col xs={6}>
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
            <ButtonToolbar>
              <OverlayTrigger placement="right" overlay={buyTooltip}>
                <Button bsStyle="primary" disabled={this.state.color === null}>
                  Set Color
                </Button>
              </OverlayTrigger>
            </ButtonToolbar>
          </Col>
          <Col xs={6}>
            <div className="Sidebar-subheader">Color</div>
            <ColorPicker
              color={color}
              expanded={this.state.colorPickerExpanded}
              onChangeComplete={this._handleColorChange}
            />
          </Col>
        </Row>
        <div className="Sidebar-row Sidebar-divider" />
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

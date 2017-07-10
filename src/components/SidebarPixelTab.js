// @flow

import type { Pixel } from '../ethereum/Pixel'

import {
  Button,
  ButtonToolbar,
  Col,
  Grid,
  OverlayTrigger,
  Popover,
  Row,
} from 'react-bootstrap'
import ColorPicker from './ColorPicker'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SidebarSimpleTab from './SidebarSimpleTab'
import contractCaller from '../ethereum/contractCaller'
import notifier from '../notifier'

import '../css/Sidebar.css'

type Props = {
  selectedPixel: ?Pixel,
};

type State = {
  color: ?string,
  colorPickerExpanded: boolean,
};

function samePixel(a: ?Pixel, b: ?Pixel): boolean {
  return !!a && !!b && a.x === b.x && a.y === b.y && a.color === b.color &&
    a.owner === b.owner;
}

class SidebarPixelTab extends Component<void, Props, State> {
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

  _handleButtonClick = (event: SyntheticMouseEvent) => {
    if (event.target instanceof HTMLElement) {
      event.target.blur();
    }
    this.refs.overlay.hide();

    if (!this.state.colorPickerExpanded) {
      this.setState({ colorPickerExpanded: true });
      return;
    }
    const { color } = this.state;
    const { selectedPixel } = this.props;
    if (!color || !selectedPixel) {
      throw new Error('Unexpected inputs');
    }

    contractCaller.setPixel(selectedPixel, color).then((transactionHash) => {
      this.setState({
        color: null,
        colorPickerExpanded: false,
      });
      notifier.transactionSubmitted(transactionHash);
    }).catch(function(error) {
      notifier.add('Transaction failed or was cancelled');
    });
  };

  _handleColorChange = ({ hex }: { hex: string }) => {
    const color = hex[0] === '#' ? hex.substr(1) : hex;
    this.setState({ color });
  };

  _renderSetColorButton() {
    const { selectedPixel } = this.props;
    if (!selectedPixel) {
      return null;
    }
    const { colorPickerExpanded, color } = this.state;
    const buttonDisabled = colorPickerExpanded && !color;

    let popoverTitle = null;
    let popoverText = null;

    if (selectedPixel.ownedByViewer) {
      if (color) {
        popoverTitle = 'Update your Pixel';
        popoverText = `Save the selected color to the blockchain by paying the
          gas cost`;
      } else {
        popoverTitle = 'Manage your Pixel';
        popoverText = `You are the owner of the pixel.
          Set the color anytime by paying the gas cost`;
      }
    } else {
      if (color) {
        const price = contractCaller.web3.fromWei(selectedPixel.price, 'ether');
        popoverTitle = 'Finalize your new Pixel';
        popoverText = `Save the selected color to the blockchain by paying
          ${price} ETH + gas cost`;
      } else {
        popoverTitle = 'Claim a Pixel';
        popoverText = `You can set the color by paying the amount listed above.
          You will become the new owner of this pixel!`;
      }
    }

    const popover = (
      <Popover id="popover-buy-button" title={popoverTitle}>
        {popoverText}
      </Popover>
    );

    return (
      <OverlayTrigger
        placement="left"
        ref="overlay"
        trigger={['hover', 'focus']}
        overlay={popover}
      >
        <Button
          bsStyle="primary"
          disabled={buttonDisabled}
          key="setColorButton"
          onClick={this._handleButtonClick}
        >
          {color ? 'Save Color' : 'Choose Color'}
        </Button>
      </OverlayTrigger>
    );
  }

  render() {
    const { selectedPixel } = this.props;
    if (!selectedPixel) {
      return (
        <SidebarSimpleTab>
          No Pixel selected. Click somewhere on the image to select one!
        </SidebarSimpleTab>
      );
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
    const price = contractCaller.web3.fromWei(selectedPixel.price, 'ether');

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
            <div className="Sidebar-row">
              <div className="Sidebar-subheader">Action</div>
              <ButtonToolbar className="Sidebar-buttons">
                {this._renderSetColorButton()}
              </ButtonToolbar>
            </div>
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
            <div className="Sidebar-subheader">Message</div>
            <div>{messageText}</div>
          </Col>
        </Row>
        <Row className="Sidebar-row">
          <Col xs={12}>
            <div className="Sidebar-subheader">Owner</div>
            <div className="Sidebar-address">{ownerText}</div>
          </Col>
        </Row>
      </Grid>
    );
  }
}

SidebarPixelTab.propTypes = {
  selectedPixel: PropTypes.object,
};

export default SidebarPixelTab

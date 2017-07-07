// @flow

import type { Pixel } from '../ethereum/Pixel'

import { Col, Grid, Row } from 'react-bootstrap'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import contractCaller from '../ethereum/contractCaller'

import '../css/Sidebar.css'

type Props = {
  hoverPixel: ?Pixel,
  selectedPixel: ?Pixel,
};

type State = {
  loading: boolean,
  message: ?string,
  owner: ?React.Element<*>,
};

class Sidebar extends Component<void, Props, State> {
  props: Props;
  state: State;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      message: null,
      owner: null,
    };
  }

  _refetch(): void {
    const { selectedPixel } = this.props;
    if (!selectedPixel) {
      return;
    }

    const { owner } = selectedPixel;
    if (!owner) {
      return;
    }

    const ownerLink = (
      <a href={'https://rinkeby.etherscan.io/address/' + owner}>{owner}</a>
    );
    const ownerText = contractCaller.getAccounts().includes(owner)
      ? <span>{ownerLink} (You)</span>
      : ownerLink;

    contractCaller.getUserMessage(owner).then((message) => {
      this.setState({ message, owner: ownerText, loading: false });
    });
  }

  componentDidMount(): void {
    this._refetch();
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    const prevPixel = prevProps.selectedPixel;
    const pixel = this.props.selectedPixel;
    if (pixel && prevPixel && (pixel.owner !== prevPixel.owner)) {
      this.setState({ loading: true }, () => {
        this._refetch();
      })
    }
  }

  render() {
    const { selectedPixel } = this.props;
    if (!selectedPixel) {
      return;
    }


    const colorText = selectedPixel.color === '000000' ? 'Not set' : (
      <span>
        #{selectedPixel.color}
        <span className="Sidebar-colorbox" style={{
          backgroundColor: `#${selectedPixel.color}`,
        }}/>
      </span>
    );

    const messageText = this.state.message ? this.state.message : 'Not set';

    const content = this.state.loading ? null : [
      <Row className="Sidebar-row" key="owner">
        <Col xs={12}>
          <div className="Sidebar-subheader">Owner</div><div>{this.state.owner}</div>
        </Col>
      </Row>,
      <Row className="Sidebar-row" key="message">
        <Col xs={12}>
          <div className="Sidebar-subheader">Message</div><div>{messageText}</div>
        </Col>
      </Row>,
    ];

    const rightContent = this.state.loading ? null : (
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

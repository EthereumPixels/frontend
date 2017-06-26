// @flow

import React, { Component } from 'react'
import PropTypes from 'prop-types'

type MousePointFunction = (
  x: number, // X coordinate of the click in DOM element frame
  y: number, // Y coordinate of the click in DOM element frame
) => void;

type MouseDeltaFunction = (deltaX: number, deltaY: number) => void;

type Props = {
  children?: React.Element<*>,
  onClick?: MousePointFunction,
  onMouseDrag?: MouseDeltaFunction,
  onMouseMove?: MousePointFunction,
  onWheel?: MouseDeltaFunction,
};

type State = {
  isDragging: boolean,
};

class Grid extends Component<void, Props, State> {
  props: Props;
  state: State;
  disableNextClick: boolean;
  lastX: number;
  lastY: number;

  constructor(props: Props) {
    super(props);
    this.state = { isDragging: false };
    this.disableNextClick = false;
  }

  _convertDocumentFrameToElementFrame(x: number, y: number): Array<number> {
    const rect = this.refs.zone.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    return [ x, y ];
  }

  _handleClick = (event: SyntheticMouseEvent): void => {
    if (this.disableNextClick) {
      this.disableNextClick = false;
      return;
    }

    if (this.props.onClick) {
      this.props.onClick.apply(
        null,
        this._convertDocumentFrameToElementFrame(event.clientX, event.clientY),
      );
    }
  };

  _handleMouseDown = (event: SyntheticMouseEvent): void => {
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.setState({ isDragging: true });
  };

  _handleMouseUp = (event: SyntheticMouseEvent): void => {
    this.setState({ isDragging: false });
  };

  _handleMouseMove = (event: SyntheticMouseEvent): void => {
    if (this.props.onMouseMove) {
      this.props.onMouseMove.apply(
        null,
        this._convertDocumentFrameToElementFrame(event.clientX, event.clientY),
      );
    }
    if (!this.state.isDragging) {
      return;
    }
    this.disableNextClick = true;
    if (this.props.onMouseDrag) {
      const deltaX = event.clientX - this.lastX;
      const deltaY = event.clientY - this.lastY;
      this.props.onMouseDrag(deltaX, deltaY);
    }
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  };

  _handleWheel = (event: SyntheticWheelEvent): void => {
    if (this.state.isDragging) {
      return;
    }
    if (this.props.onWheel) {
      this.props.onWheel(event.deltaX, event.deltaY);
    }
  }

  render() {
    let cursor = 'default';
    if (this.props.onClick) {
      cursor = 'pointer';
    }
    if (this.state.isDragging && this.props.onMouseDrag) {
      cursor = 'grabbing';
    }

    return (
      <div
        ref="zone"
        style={{ cursor }}
        onClick={this._handleClick}
        onMouseDown={this._handleMouseDown}
        onMouseMove={this._handleMouseMove}
        onMouseUp={this._handleMouseUp}
        onWheel={this._handleWheel}
      >
        {this.props.children}
      </div>
    );
  }
}

Grid.propTypes = {
  onClick: PropTypes.func,
  onMouseDrag: PropTypes.func,
  onMouseMove: PropTypes.func,
  onWheel: PropTypes.func,
};

export default Grid

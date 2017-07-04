// @flow

import React, { Component } from 'react'
import PropTypes from 'prop-types'

type MousePointFunction = (
  x: number, // X coordinate of the click in DOM element frame
  y: number, // Y coordinate of the click in DOM element frame
) => void;

type MouseDeltaFunction = (
  x: number,
  y: number,
  deltaX: number,
  deltaY: number,
) => void;

type Props = {
  children?: React.Element<*>,
  onClick?: MousePointFunction,
  onMouseDrag?: MouseDeltaFunction,
  onMouseLeave?: Function,
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

  _convertDocumentFrameToElementFrame(
    x: number,
    y: number,
  ): { x: number, y:  number } {
    const rect = this.refs.zone.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    return { x, y };
  }

  _handleClick = (event: SyntheticMouseEvent): void => {
    if (this.disableNextClick) {
      this.disableNextClick = false;
      return;
    }

    const { x, y } = this._convertDocumentFrameToElementFrame(
      event.clientX,
      event.clientY,
    );
    if (this.props.onClick) {
      this.props.onClick(x, y);
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
    const { x, y } = this._convertDocumentFrameToElementFrame(event.clientX, event.clientY);
    if (this.props.onMouseMove) {
      this.props.onMouseMove(x, y);
    }
    if (!this.state.isDragging) {
      return;
    }
    this.disableNextClick = true;
    if (this.props.onMouseDrag) {
      const deltaX = event.clientX - this.lastX;
      const deltaY = event.clientY - this.lastY;
      this.props.onMouseDrag(x, y, deltaX, deltaY);
    }
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  };

  _handleWheel = (event: SyntheticWheelEvent): void => {
    if (this.state.isDragging) {
      return;
    }
    const { x, y } = this._convertDocumentFrameToElementFrame(
      event.clientX,
      event.clientY,
    );
    if (this.props.onWheel) {
      this.props.onWheel(x, y, event.deltaX, event.deltaY);
    }
  }

  componentDidMount(): void {
    window.oncontextmenu = (event) => {
      return event.target === this.refs.zone || this.state.isDragging
        ? false
        : null;
    };
    window.onmousemove = this._handleMouseMove;
    window.onmouseup = this._handleMouseUp;
  }

  componentWillUnmount(): void {
    window.oncontextmenu = null;
    window.onmousemove = null;
    window.onmouseup = null;
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
        onMouseLeave={this.props.onMouseLeave}
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

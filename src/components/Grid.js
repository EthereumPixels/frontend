// @flow

import type { Pixel } from '../ethereum/Pixel'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MouseZone from './MouseZone'
import contractCaller from '../ethereum/contractCaller'
import store from '../store'

import '../css/Grid.css'

type Props = {
  centerX: number, // X coordinate of the camera center in image frame
  centerY: number, // Y coordinate of the camera center in image frame
  gridSize: number,
  height: number,
  nonce: number,
  sourceImage: ?HTMLCanvasElement,
  width: number,
  zoom: number,
};

class Grid extends Component<void, Props, void> {
  _getScalingFactor(): number {
    const { gridSize, width, zoom } = this.props;
    return zoom * width / gridSize;
  }

  _convertElementFrameToImageFrame(elemX: number, elemY: number): Pixel {
    const { centerX, centerY, height, width } = this.props;
    const factor = this._getScalingFactor();
    const originX = width / 2 - centerX * factor;
    const originY = height / 2 - centerY * factor;
    const x = Math.floor((elemX - originX) / factor);
    const y = Math.floor((elemY - originY) / factor);
    return { x, y };
  }

  _handleClick = (x: number, y: number): void => {
    const pixel = this._convertElementFrameToImageFrame(x, y);
    contractCaller.selectPixel(pixel);
  };

  _handleMouseMove = (x: number, y: number): void => {
    const coords = this._convertElementFrameToImageFrame(x, y);
    store.dispatch({ type: 'PIXEL_HOVER', ...coords });
  };

  _handleMouseDrag = (
    elemX: number,
    elemY: number,
    deltaX: number,
    deltaY: number,
  ): void => {
    store.dispatch({ type: 'MOVE', dx: -deltaX, dy: -deltaY });
  };

  _handleWheel = (
    elemX: number,
    elemY: number,
    deltaX: number,
    deltaY: number,
  ): void => {
    const { x, y } = this._convertElementFrameToImageFrame(elemX, elemY);
    store.dispatch({ type: 'ZOOM', dx: deltaX, dy: deltaY, x, y });
  };

  _redraw = (): void => {
    if (!this.props.sourceImage) {
      return;
    }
    const { canvas } = this.refs;
    const { centerX, centerY, gridSize, zoom } = this.props;
    const factor = this._getScalingFactor();
    const originX = canvas.width / 2 - centerX * factor;
    const originY = canvas.height / 2 - centerY * factor;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      this.props.sourceImage,
      0, 0, gridSize, gridSize,
      originX, originY, canvas.width * zoom, canvas.width * zoom,
    );
  }

  componentDidUpdate() {
    this._redraw();
  }

  componentDidMount() {
    this._redraw();
  }

  render() {
    return (
      <MouseZone
        onClick={this._handleClick}
        onMouseDrag={this._handleMouseDrag}
        onMouseMove={this._handleMouseMove}
        onWheel={this._handleWheel}
      >
        <div className="Grid">
          <canvas
            className="Grid-canvas"
            ref="canvas"
            height={this.props.height}
            width={this.props.width}
          />
        </div>
      </MouseZone>
    );
  }
}

Grid.propTypes = {
  centerX: PropTypes.number.isRequired,
  centerY: PropTypes.number.isRequired,
  gridSize: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  nonce: PropTypes.number.isRequired,
  sourceImage: PropTypes.object,
  width: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
};

export default Grid

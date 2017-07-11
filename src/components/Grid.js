// @flow

import type { Pixel } from '../ethereum/Pixel'

import MouseZone from './MouseZone'
import Overlay from './Overlay'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import contractCaller from '../ethereum/contractCaller'
import store, { backgroundCanvas } from '../store'

import '../css/Grid.css'

type Props = {
  centerX: number, // X coordinate of the camera center in image frame
  centerY: number, // Y coordinate of the camera center in image frame
  gridSize: number,
  height: number,
  hoverPixel: ?Pixel,
  nonce: number,
  selectedPixel: ?Pixel,
  sidebarVisible: boolean,
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

  _convertImageFrameToElementFrame(imageX: number, imageY: number): Pixel {
    const { centerX, centerY, height, width } = this.props;
    const factor = this._getScalingFactor();
    const originX = width / 2 - centerX * factor;
    const originY = height / 2 - centerY * factor;
    const x = imageX * factor + originX;
    const y = imageY * factor + originY;
    return { x, y };
  }

  _convertImagePixelToElementPixel(imagePixel?: ?Pixel): ?Pixel {
    return imagePixel
      ? this._convertImageFrameToElementFrame(imagePixel.x, imagePixel.y)
      : null;
  }

  _handleClick = (x: number, y: number): void => {
    const pixel = this._convertElementFrameToImageFrame(x, y);
    contractCaller.selectPixel(pixel);
  };

  _handleMouseLeave = (): void => {
    store.dispatch({ type: 'PIXEL_HOVER', pixel: null });
  };

  _handleMouseMove = (x: number, y: number): void => {
    const pixel = this._convertElementFrameToImageFrame(x, y);
    store.dispatch({ type: 'PIXEL_HOVER', pixel });
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
      backgroundCanvas,
      0, 0, gridSize, gridSize,
      originX, originY, canvas.width * zoom, canvas.width * zoom,
    );
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
    const { hoverPixel, selectedPixel } = this.props;

    return (
      <MouseZone
        onClick={this._handleClick}
        onMouseDrag={this._handleMouseDrag}
        onMouseMove={this._handleMouseMove}
        onMouseLeave={this._handleMouseLeave}
        onWheel={this._handleWheel}
      >
        <Overlay
          hoverElemPixel={this._convertImagePixelToElementPixel(hoverPixel)}
          hoverPixel={hoverPixel}
          pixelSize={this._getScalingFactor()}
          selectedElemPixel={this._convertImagePixelToElementPixel(selectedPixel)}
          sidebarVisible={this.props.sidebarVisible}
        >
          <div className="Grid">
            <canvas
              className="Grid-canvas"
              ref="canvas"
              height={this.props.height}
              width={this.props.width}
            />
          </div>
        </Overlay>
      </MouseZone>
    );
  }
}

Grid.propTypes = {
  centerX: PropTypes.number.isRequired,
  centerY: PropTypes.number.isRequired,
  gridSize: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  hoverPixel: PropTypes.object,
  nonce: PropTypes.number.isRequired,
  selectedPixel: PropTypes.object,
  sidebarVisible: PropTypes.bool.isRequired,
  sourceImage: PropTypes.object,
  width: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
};

export default Grid

// @flow

import type { Pixel } from '../ethereum/Pixel'

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { GRID_SIZE } from '../configs'

import '../css/Overlay.css'

type Props = {
  children?: React.Element<*>,
  hoverElemPixel?: ?Pixel,
  hoverPixel?: ?Pixel,
  pixelSize: number,
  selectedElemPixel?: ?Pixel,
};

class Overlay extends PureComponent<void, Props, void> {
  _renderTooltip(): ?React.Element<*> {
    const { hoverPixel, hoverElemPixel, pixelSize } = this.props;
    if (
      !hoverPixel || !hoverElemPixel || hoverPixel.x < 0 ||
      hoverPixel.y < 0 || hoverPixel.x > GRID_SIZE ||
      hoverPixel.y > GRID_SIZE
    ) {
      return null;
    }
    const marginLeft = document && document.body &&
      hoverElemPixel.x > document.body.clientWidth * 0.6
        ? -90 - pixelSize * 2
        : null;
    return (
      <div className="Overlay-tooltip" style={{
        marginLeft,
        left: hoverElemPixel.x + pixelSize + 16,
        top: hoverElemPixel.y + pixelSize,
      }}>
        {hoverPixel.x}, {hoverPixel.y}
      </div>
    );
  }

  render() {
    const { hoverElemPixel, selectedElemPixel, pixelSize } = this.props;

    const hoverOverlay = hoverElemPixel
      ? <div className="Overlay-hover" style={{
        left: hoverElemPixel.x,
        top: hoverElemPixel.y,
        width: pixelSize,
        height: pixelSize,
      }} />
      : null;

    const className = classNames({
      'Overlay-blackout': true,
      'Overlay-enabled': selectedElemPixel,
    });

    const selectedOverlay = <div className={className} style={{
      left: selectedElemPixel ? selectedElemPixel.x : 0,
      top: selectedElemPixel ? selectedElemPixel.y : 0,
      width: pixelSize,
      height: pixelSize,
    }} />;

    return (
      <div className="Overlay">
        {this.props.children}
        {selectedOverlay}
        {hoverOverlay}
        {this._renderTooltip()}
      </div>
    );
  }
}

Overlay.propTypes = {
  hoverElemPixel: PropTypes.object,
  hoverPixel: PropTypes.object,
  pixelSize: PropTypes.number.isRequired,
  selectedElemPixel: PropTypes.object,
};

export default Overlay

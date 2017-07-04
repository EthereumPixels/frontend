// @flow

import type { Pixel } from '../ethereum/Pixel'

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import '../css/Overlay.css'

type Props = {
  children?: React.Element<*>,
  hoverElemPixel?: ?Pixel,
  selectedElemPixel?: ?Pixel,
  pixelSize: number,
};

class Overlay extends PureComponent<void, Props, void> {
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
        {hoverOverlay}
        {selectedOverlay}
      </div>
    );
  }
}

export default Overlay

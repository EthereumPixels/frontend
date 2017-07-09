// @flow

import React from 'react'
import { Clearfix, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { CustomPicker } from 'react-color'
import { Checkboard, EditableInput } from 'react-color/lib/components/common'
import classNames from 'classnames'

import '../css/ColorPicker.css'

const DEFAULT_COLORS = new Map([
  ['#3f32ae', 'sapphire'],
  ['#e30ec2', 'hot magenta'],
  ['#baaaff', 'pale violet'],
  ['#ffffff', 'white'],
  ['#ff949d', 'rose pink'],
  ['#e80200', 'red'],
  ['#7a243d', 'wine'],
  ['#010101', 'black'],
  ['#195648', 'dark blue green'],
  ['#6a8927', 'mossy green'],
  ['#16ed75', 'minty green'],
  ['#32c1c3', 'topaz'],
  ['#057fc1', 'cerulean'],
  ['#6e4e23', 'mud brown'],
  ['#c98f4c', 'dull orange'],
  ['#efe305', 'piss yellow'],
]);

type Props = {
  expanded: boolean,
  hex: string,
  onChange: Function,
};

class ColorPicker extends React.Component<void, Props, void> {
  _handleColorChange = ({ hex }) => {
    let color = hex[0] === '#' ? hex.substr(1) : hex;
    if (color.length !== 3 && hex.length !== 6) {
      return;
    }
    color = color === '000000' || color === '000' ? 'transparent' : color;
    this.props.onChange(color);
  };

  render() {
    const colors = [];
    DEFAULT_COLORS.forEach((name, color) => {
      const tooltip = <Tooltip id={name}>{name}</Tooltip>;
      colors.push(
        <OverlayTrigger key={color} placement="bottom" overlay={tooltip}>
          <div
            className="ColorPicker-color"
            onClick={() => this.props.onChange(color)}
            style={{ backgroundColor: color }}
          />
        </OverlayTrigger>
      );
    });

    const color = this.props.hex;

    const className = classNames({
      'ColorPicker': true,
      'ColorPicker-expanded': this.props.expanded,
      'ColorPicker-transparent': color === 'transparent',
    });

    return (
      <Clearfix className={className}>
        <div
          className="ColorPicker-colorbox"
          style={{ backgroundColor: color }}
        >
          <div className="ColorPicker-checkboard">
            <Checkboard size={15} />
          </div>
        </div>
        <EditableInput
          label="hex"
          onChange={this._handleColorChange}
          style={{ label: { display: 'none' } }}
          value={this.props.hex}
        />
        <Clearfix className="ColorPicker-palette">
          {colors}
        </Clearfix>
      </Clearfix>
    );
  }
}

export default CustomPicker(ColorPicker);

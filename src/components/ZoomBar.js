// @flow

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Glyphicon } from 'react-bootstrap'
import classNames from 'classnames'
import store from '../store'

import { MAX_ZOOM, MIN_ZOOM } from '../configs'

import '../css/ZoomBar.css'

type Props = {
  zoom: number,
};

class Notifications extends Component<void, Props, void> {
  props: Props;

  render() {
    return (
      <div className="ZoomBar" onMouseMove={(e) => e.stopPropagation()}>
        <div>
          <div className="ZoomBar-button-group">
            <Glyphicon
              className={classNames({
                'ZoomBar-button': true,
                'ZoomBar-button-disabled': this.props.zoom === MAX_ZOOM,
              })}
              glyph="plus"
              onClick={() => store.dispatch({ type: 'ZOOM_IN' })}
            />
            <Glyphicon
              className={classNames({
                'ZoomBar-button': true,
                'ZoomBar-button-disabled': this.props.zoom === MIN_ZOOM,
              })}
              glyph="minus"
              onClick={() => store.dispatch({ type: 'ZOOM_OUT' })}
            />
          </div>
        </div>
      </div>
    );
  }
}

Notifications.propTypes = {
  zoom: PropTypes.number.isRequired,
};

export default Notifications

// @flow

import { connect } from 'react-redux'
import ZoomBar from '../components/ZoomBar'

const mapStateToProps = (state) => ({
  zoom: state.get('zoom'),
});

const ZoomBarContainer = connect(mapStateToProps)(ZoomBar);

export default ZoomBarContainer

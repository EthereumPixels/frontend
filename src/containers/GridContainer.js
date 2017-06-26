// @flow

import { connect } from 'react-redux'
import Grid from '../components/Grid'

const mapStateToProps = (state) => ({
  centerX: state.get('centerX'),
  centerY: state.get('centerY'),
  gridSize: state.get('gridSize'),
  height: state.get('canvasHeight'),
  sourceImage: state.get('sourceImage'),
  width: state.get('canvasWidth'),
  zoom: state.get('zoom'),
});

const GridContainer = connect(mapStateToProps)(Grid);

export default GridContainer

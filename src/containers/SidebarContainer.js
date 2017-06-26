// @flow

import { connect } from 'react-redux'
import Sidebar from '../components/Sidebar'

const mapStateToProps = (state) => ({
  hoverX: state.get('hoverX'),
  hoverY: state.get('hoverY'),
  sourceImage: state.get('sourceImage'),
  selectedPixel: state.get('selectedPixel') ? state.get('selectedPixel').toJS() : null,
});

const SidebarContainer = connect(mapStateToProps)(Sidebar);

export default SidebarContainer

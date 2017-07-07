// @flow

import { connect } from 'react-redux'
import Sidebar from '../components/Sidebar'

const mapStateToProps = (state) => ({
  hoverPixel: state.get('hoverPixel'),
  selectedPixel: state.get('selectedPixel') ? state.get('selectedPixel').toJS() : null,
  selectedSidebar: state.get('selectedSidebar'),
});

const SidebarContainer = connect(mapStateToProps)(Sidebar);

export default SidebarContainer

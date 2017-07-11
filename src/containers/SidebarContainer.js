// @flow

import { connect } from 'react-redux'
import Sidebar from '../components/Sidebar'

const mapStateToProps = (state) => ({
  connected: state.get('connected'),
  hoverPixel: state.get('hoverPixel'),
  selectedPixel: state.get('selectedPixel') ? state.get('selectedPixel').toJS() : null,
  selectedSidebar: state.get('selectedSidebar'),
  users: state.get('users').toJS(),
});

const SidebarContainer = connect(mapStateToProps)(Sidebar);

export default SidebarContainer

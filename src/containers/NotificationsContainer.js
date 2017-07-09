// @flow

import { connect } from 'react-redux'
import Notifications from '../components/Notifications'

const mapStateToProps = (state) => ({
  notifications: state.get('notifications').toArray(),
});

const NotificationsContainer = connect(mapStateToProps)(Notifications);

export default NotificationsContainer

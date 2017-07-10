// @flow

import React, { PureComponent } from 'react'

type Props = {
  children: React.Element<*>,
};

class SidebarSimpleTab extends PureComponent<void, Props, void> {
  props: Props;

  render() {
    return (
      <div className="Sidebar-simple">
        {this.props.children}
      </div>
    );
  }
}

export default SidebarSimpleTab

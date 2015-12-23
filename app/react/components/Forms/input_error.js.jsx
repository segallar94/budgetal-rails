import React from 'react';
import classNames from 'classnames';

export default class InputError extends React.Component {
  constructor(props) {
    super(props);
    this.props = {
      showError: false,
      message: ''
    }
  }

  render() {
    let cls = classNames({show: this.props.showError, error: true});
    return (
      <small className={cls}>{this.props.message}</small>
    );
  }
}

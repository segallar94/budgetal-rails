import React from 'react';
import classNames from 'classnames';

export default class ImportModal extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    category: React.PropTypes.object.isRequired,
    hidden: React.PropTypes.bool.isRequired,
    cancel: React.PropTypes.func.isRequired,
    import: React.PropTypes.func.isRequired
  }

  cancel = (e) => {
    e.preventDefault();
    var stayOpen = _.isEmpty(_.intersection(e.target.classList, ['overlay', 'close-button']));
    if (!stayOpen) { this.props.cancel(); }
  }

  render() {
    let classes = classNames('overlay tiny', {
      fadeIn: !this.props.hidden,
      hide: this.props.hidden
    });
    return (
      <div className={classes} onClick={this.cancel}>
        <div className="page">
          <a href='#' className="close-button" onClick={this.cancel}>&#215;</a>
          <h3 className='text-center blue-color'>Import</h3>
          <hr />
          <p>Do you want to import budget items from your previous month's <strong>{this.props.category.name}</strong> category?</p>
          <a id="content-settings-overlay-confirm" href='#' className="small button expand radius" onClick={this.props.import}>
            <i className='fi-icon fi-download'></i> Import {this.props.category.name}
          </a>
        </div>
      </div>
    );
  }
}
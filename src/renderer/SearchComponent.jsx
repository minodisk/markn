'use strict';

var React = require('react');
var SearchStore = require('./SearchStore');
var dispatcher = require('./Dispatcher');

var $ = React.createElement;

module.exports = class SearchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: '',
      isShown: false
    };

    this.action = new ActionCreator();
    this.store = new SearchStore();
    this.store.on('openFind', this.show.bind(this));
    this.store.on('closeFind', this.hide.bind(this));
  }

  update(index) {
    this.setState({index: '1/11'});
  }

  show() {
    this.setState({isShown: true});
  }

  hide() {
    this.setState({isShown: false});
  }

  render() {
    var classNames = ['search-box'];
    if (this.state.isShown) {
      classNames.push('is-shown');
    }
    return (
      <div className={classNames.join(' ')}>
        <div className='search'>
          <input type='text'/>
          <span className='index'>{this.state.index}</span>
        </div>
        <button className='fa fa-chevron-up button-up'/>
        <button className='fa fa-chevron-down button-up'/>
        <button className='fa fa-times button-close' onClick={this.onClickClose.bind(this)}/>
      </div>
    );
  }

  onClickClose() {
    this.action.close();
  }
}

class ActionCreator {
  close() {
    dispatcher.emit('closeFind');
  }
}

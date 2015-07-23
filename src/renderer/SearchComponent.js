'use strict';

import React from 'react'
import SearchStore from './SearchStore'
import dispatcher from './Dispatcher'

var $ = React.createElement;

export default class SearchComponent extends React.Component {
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
    React.findDOMNode(this.refs.search).focus();
  }

  hide() {
    this.setState({isShown: false});
  }

  onInput() {
    var text = React.findDOMNode(this.refs.search).value;
  }

  render() {
    var classNames = ['search-box'];
    if (this.state.isShown) {
      classNames.push('is-shown');
    }
    return (
      <div className={classNames.join(' ')}>
        <div className='search'>
          <input type='text' ref='search' onInput={this.onInput.bind(this)}/>
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

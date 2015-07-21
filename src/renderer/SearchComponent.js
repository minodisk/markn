'use strict';

import React from 'react'
import SearchStore from './SearchStore'

var $ = React.createElement;

export default class SearchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: '',
      isShown: false
    };

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
    if (this.state.isShow) {
      classNames.push('is-shown');
    }
    return $('div', {className: classNames}, [
      $('div', {className: 'search'}, [
        $('input', {type: 'text'}),
        $('span', {className: 'index'}, [this.state.index])
      ]),
      $('button', {className: ['fa', 'fa-chevron-up', 'button-up']}),
      $('button', {className: ['fa', 'fa-chevron-down', 'button-up']}),
      $('button', {className: ['fa', 'fa-times', 'button-close']})
    ]);
  }
}

'use strict';

import React from 'react'
import md2react from 'imports?React=react!../../node_modules/md2react/lib/index'
import EventEmitter from 'events'
import dispatcher from './Dispatcher'
import MarkdownStore from './MarkdownStore'

var $ = React.createElement;

export default class MarkdownComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {content: null};

    this.action = new ActionCreator();
    this.store = new MarkdownStore();
    this.store.on('change', this.update.bind(this));
  }

  update(md) {
    var el = md2react(md, {
      gfm: true,
      breaks: true,
      tables: true,
      commonmark: true,
      footnotes: true
    });
    this.setState({content: el});
  }

  render() {
    return $('div',  {className: 'markdown-body'},  [this.state.content]);
  }
}

class ActionCreator {
}

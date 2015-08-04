'use strict';

import React from 'react'
import md2react from 'imports?React=react!../../node_modules/md2react/lib/index'
import MarkdownStore from './MarkdownStore'

var $ = React.createElement;

export default class MarkdownComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: null,
      search: null
    };

    this.action = new ActionCreator();
    this.store = new MarkdownStore();
    this.store.on('change', this.update.bind(this));
    this.store.on('search', this.mark.bind(this));
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

  mark(text) {
    this.setState({search: text});
  }

  render() {
    return (
      <div className='markdown-body'>{this.state.content}</div>
    )
  }
}

class ActionCreator {
}

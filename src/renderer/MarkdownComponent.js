import React from 'react'
import MyCompiler from './MyCompiler'
import MarkdownStore from './MarkdownStore'

export default class MarkdownComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: null,
      search: null
    };

    this.compiler = new MyCompiler({
      gfm: true,
      breaks: true,
      tables: true,
      commonmark: true,
      footnotes: true
    });
    this.action = new ActionCreator();
    this.store = new MarkdownStore();
    this.store.on('update', this.update.bind(this));
  }

  update(md, dirname, search) {
    this.setState({content: this.compiler.compile(md, dirname, search)});
  }

  render() {
    return this.state.content;
  }
}

class ActionCreator {
}

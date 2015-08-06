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
    let elem = this.compiler.compile('foo');
    this.action = new ActionCreator();
    this.store = new MarkdownStore();
    this.store.on('change', this.update.bind(this));
    this.store.on('search', this.mark.bind(this));
  }

  update(md) {
    let el = this.compiler.compile(md);
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

import React from 'react'
import MyCompiler from './MyCompiler'
import MarkdownStore from './MarkdownStore'
import dispatcher from './Dispatcher'

export default class MarkdownComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      md: null,
      dirname: null,
      search: null
    };

    this.compiler = new MyCompiler({
      gfm: true,
      breaks: true,
      tables: true,
      commonmark: true,
      footnotes: true
    });
    this.store = new MarkdownStore();
    this.store.on('update', this.update.bind(this));
    this.action = new ActionCreator();
  }

  update(md, dirname, search) {
    this.setState({md, dirname, search});
  }

  render() {
    return this.compiler.compile(this.state);
  }

  componentDidUpdate() {
    let marks = [];
    for (let i = 0; i < this.compiler.marksCount; i++) {
      let mark = React.findDOMNode(this.refs[`mark${i}`]);
      marks.push(mark);
    }
    this.action.updateMarks(marks);
  }
}

class ActionCreator {
  updateMarks(marks) {
    dispatcher.emit('update-marks', marks);
  }
}

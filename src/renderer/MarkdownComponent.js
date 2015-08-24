import React from 'react'
import MyCompiler from './MyCompiler'
import fileStore from './stores/file'
import markdownStore from './markdownStore'
import searchStore from './SearchStore'
import dispatcher from './Dispatcher'
import remote from 'remote'

let path = remote.require('path');

export default class MarkdownComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      md: '',
      dirname: '',
      search: '',
      indication: -1
    };

    this.compiler = new MyCompiler({
      gfm: true,
      breaks: true,
      tables: true,
      commonmark: true,
      footnotes: true
    });

    fileStore.on('change', this.onChange.bind(this));
    markdownStore.on('searching', this.onSearching.bind(this));
    searchStore.on('indicating', this.onIndicating.bind(this));

    this.action = new ActionCreator();
  }

  onChange(file) {
    this.isUpdating = true;
    this.setState({
      md: file.content,
      dirname: path.dirname(file.path),
    });
  }

  onSearching(search) {
    this.isSearching = true;
    this.setState({search});
  }

  onIndicating(indication) {
    this.setState({indication});
  }

  render() {
    return this.compiler.compile(this.state);
  }

  componentDidUpdate() {
    if (this.isUpdating) {
      this.isUpdating = false;
      this.action.updated();
    }
    if (this.isSearching) {
      this.isSearching = false;
      let marks = [];
      for (let i = 0; i < this.compiler.marksCount; i++) {
        let mark = React.findDOMNode(this.refs[`mark${i}`]);
        marks.push(mark);
      }
      this.action.searched(marks);
    }
  }
}

class ActionCreator {
  updated(marks) {
    dispatcher.emit('updated');
  }

  searched(marks) {
    dispatcher.emit('searched', marks);
  }
}

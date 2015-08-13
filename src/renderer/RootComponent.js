import React from 'react'
import Search from './SearchComponent'
import Markdown from './MarkdownComponent'
import Rail from './RailComponent'
import searchStore from './SearchStore'

export default class RootComponent extends React.Component {
  constructor(props) {
    super(props);
    this.store = searchStore;
    this.store.on('focus-mark', this.onFocusMark.bind(this));
  }

  onFocusMark(mark) {
    let rect = mark.getBoundingClientRect();
    let root = React.findDOMNode(this.refs.root);
    root.scrollTop = rect.top;
  }

  render() {
    return <div className="root" ref="root">
      <div className="body">
        <Markdown/>
        <Rail/>
      </div>
      <Search/>
    </div>;
  }
}

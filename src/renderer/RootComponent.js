import React from 'react'
import Search from './SearchComponent'
import Markdown from './MarkdownComponent'
import Rail from './RailComponent'
import searchStore from './SearchStore'
import dispatcher from './Dispatcher'

export default class RootComponent extends React.Component {
  constructor(props) {
    super(props);

    this.action = new ActionCreator();

    this.searchStore = searchStore;
    this.searchStore.on('indicating', this.onIndicating.bind(this));
  }

  onIndicating({}, {}, mark) {
    if (!mark) return;
    let rect = mark.getBoundingClientRect();
    let root = React.findDOMNode(this.refs.root);
    root.scrollTop += rect.top - window.innerHeight / 2;
  }

  onScroll(e) {
    let root = React.findDOMNode(this.refs.root);
    this.action.scrolled(root.scrollTop);
  }

  render() {
    return <div className="root" ref="root" onScroll={this.onScroll.bind(this)}>
      <div className="body">
        <Markdown/>
        <Rail/>
      </div>
      <Search/>
    </div>;
  }
}

class ActionCreator {
  scrolled(scrollTop) {
    dispatcher.emit('scrolled', scrollTop);
  }
}

import React from 'react'
import Markdown from './markdown'
import Rail from './rail'
import windowStore from '../stores/window'
import searchStore from '../stores/search'
import scrollAction from '../actions/scroll'

export default class BodyComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    windowStore.on('resize', this.onWindowResized.bind(this));
    searchStore.on('indicating', this.onIndicating.bind(this));
  }

  onWindowResized(size) {
    let body = React.findDOMNode(this.refs.body);
    body.style.height = `${size.y - 30}px`;
  }

  onIndicating({}, {}, mark) {
    if (!mark) return;
    let rect = mark.getBoundingClientRect();
    let root = React.findDOMNode(this.refs.root);
    root.scrollTop += rect.top - window.innerHeight / 2;
  }

  onScroll(e) {
    let body = React.findDOMNode(this.refs.body);
    scrollAction.scrolled(body.scrollTop);
  }

  render() {
    return <div className="body" ref="body" onScroll={this.onScroll.bind(this)}>
      <div className="content" ref="content">
        <Markdown/>
        <Rail/>
      </div>
    </div>;
  }
}

import React from 'react'
import railStore from './RailStore'

export default class RailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      marks: [],
      scrollTop: 0
    };

    window.addEventListener('resize', this.onResized.bind(this), false);
    railStore.on('searched', this.onSearched.bind(this));
    railStore.on('scrolled', this.onScrolled.bind(this));

    this.action = new ActionCreator();
  }

  onResized() {
    this.forceUpdate();
  }

  onSearched(marks) {
    this.setState({marks});
  }

  onScrolled(scrollTop) {
    this.setState({scrollTop});
  }

  render() {
    return <div className="rail">{
      this.state.marks.map((mark) => {
        let rect = mark.getBoundingClientRect();
        let style = {top: Math.round(this.state.scrollTop + rect.top + rect.height / 2 - 1.5)};
        return <div className="mark" style={style}></div>;
      })
    }</div>;
  }
}

class ActionCreator {
}

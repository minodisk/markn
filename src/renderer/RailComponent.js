import React from 'react'
import RailStore from './RailStore'

export default class RailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      marks: []
    };

    this.store = new RailStore();
    this.store.on('update', this.update.bind(this));
    this.action = new ActionCreator();
  }

  update(marks) {
    this.setState({marks});
  }

  render() {
    return <div className="rail">{
      this.state.marks.map((mark) => {
        let rect = mark.getBoundingClientRect();
        let style = {top: Math.round(rect.top + rect.height / 2 - 1.5)};
        return <div className="mark" style={style}></div>;
      })
    }</div>;
  }
}

class ActionCreator {
}

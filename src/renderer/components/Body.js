import React from 'react'
import Markdown from './markdown'
// import Rail from './rail'
// import windowStore from '../stores/window'
// import searchStore from '../stores/search'
// import fileStore from '../stores/file'
// import historyStore from '../stores/history'
// import scrollAction from '../actions/scroll'

import React, { Component, PropTypes } from 'react';

class Counter extends Component {
  render() {
    const { increment, incrementIfOdd, incrementAsync, decrement, counter } = this.props;
    return (
      <p>
        Clicked: {counter} times
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
        {' '}
        <button onClick={incrementIfOdd}>Increment if odd</button>
        {' '}
        <button onClick={() => incrementAsync()}>Increment async</button>
      </p>
    );
  }
}

Counter.propTypes = {
  increment: PropTypes.func.isRequired,
  incrementIfOdd: PropTypes.func.isRequired,
  incrementAsync: PropTypes.func.isRequired,
  decrement: PropTypes.func.isRequired,
  counter: PropTypes.number.isRequired
};

export default Counter;

export default class BodyComponent extends React.Component {
  displayName = 'BodyComponent'

  constructor (props) {
    super(props)

    this.state = {
    }

    windowStore.on('resize', this.onWindowResized.bind(this))
    searchStore.on('indicating', this.onIndicating.bind(this))
    fileStore.on('changed', this.onFileChanged.bind(this))
    historyStore.on('forwarded', this.onFileChanged.bind(this))
    historyStore.on('backwarded', this.onFileChanged.bind(this))
  }

  onWindowResized (size) {
    let body = React.findDOMNode(this.refs.body)
    body.style.height = `${size.y - 30}px`
  }

  onIndicating ({}, {}, mark) {
    if (!mark) return
    let rect = mark.getBoundingClientRect()
    let body = React.findDOMNode(this.refs.body)
    body.scrollTop += rect.top - window.innerHeight / 2
  }

  onFileChanged () {
    let body = React.findDOMNode(this.refs.body)
    body.scrollTop = 0
  }

  render () {
    return (
      <div className='body' ref='body' onScroll={this.onScroll.bind(this)}>
        <div className='content' ref='content'>
          <Markdown/>
          <Rail/>
        </div>
      </div>
    )
  }

  onScroll (e) {
    let body = React.findDOMNode(this.refs.body)
    scrollAction.scrolled(body.scrollTop)
  }
}

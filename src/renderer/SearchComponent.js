import React from 'react'
import searchStore from './searchStore'
import dispatcher from './Dispatcher'
import classnames from 'classnames'

export default class SearchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      total: 0,
      isShown: false,
      disabled: false
    };

    this.action = new ActionCreator();
    this.store = searchStore;
    this.store.on('openFind', this.show.bind(this));
    this.store.on('closeFind', this.hide.bind(this));
    this.store.on('disabling', this.onDisabling.bind(this));
    this.store.on('enabling', this.onEnabling.bind(this));
    this.store.on('indicating', this.onIndicating.bind(this));
  }

  show() {
    this.setState({isShown: true});
    let input = React.findDOMNode(this.refs.search);
    input.focus();
    input.select();
  }

  hide() {
    this.setState({isShown: false});
  }

  onDisabling() {
    this.setState({disabled: true});
  }

  onEnabling() {
    this.setState({disabled: false});
  }

  onIndicating(current, total) {
    this.setState({current, total});
  }

  render() {
    return (
      <div className={classnames('search-box', {'is-shown': this.state.isShown})}>
        <div className='search'>
          <input type='text' ref='search' onInput={this.action.input} onKeyDown={this.action.keydown}/>
          <span className='indication'>{this.state.total === 0 ? '' : `${this.state.current + 1} / ${this.state.total}`}</span>
        </div>
        <button className='fa fa-chevron-up button-up' disabled={this.state.disabled} onClick={this.action.backward}/>
        <button className='fa fa-chevron-down button-down' disabled={this.state.disabled} onClick={this.action.forward}/>
        <button className='fa fa-times button-close' onClick={this.action.close}/>
      </div>
    );
  }

  onPrevClick() {
  }

  onNextClick() {
  }

  onCloseClick() {
    this.action.close();
  }
}

class ActionCreator {
  close() {
    dispatcher.emit('closeFind');
  }

  input(e) {
    dispatcher.emit('searching', e.currentTarget.value);
  }

  keydown(e) {
    if (e.key != 'Enter') return;
    dispatcher.emit('forwarding');
  }

  forward() {
    dispatcher.emit('forwarding');
  }

  backward() {
    dispatcher.emit('backwarding');
  }
}

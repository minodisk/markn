import React from 'react'
import SearchStore from './SearchStore'
import dispatcher from './Dispatcher'

export default class SearchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: '',
      isShown: false,
      disabled: false
    };

    this.action = new ActionCreator();
    this.store = new SearchStore();
    this.store.on('openFind', this.show.bind(this));
    this.store.on('closeFind', this.hide.bind(this));
    this.store.on('updateDisable', this.updateDisable.bind(this));
  }

  update(index) {
    this.setState({index: '1/11'});
  }

  show() {
    this.setState({isShown: true});
    React.findDOMNode(this.refs.search).focus();
  }

  hide() {
    this.setState({isShown: false});
  }

  updateDisable(disabled) {
    this.setState({disabled});
  }

  onInput() {
    let text = React.findDOMNode(this.refs.search).value;
    this.action.search(text);
  }

  onKeyDown(e) {
    if (e.key != 'Enter') return;
    this.action.scrollToNext();
  }

  render() {
    let classNames = ['search-box'];
    if (this.state.isShown) {
      classNames.push('is-shown');
    }
    console.log(this.state);
    return (
      <div className={classNames.join(' ')}>
        <div className='search'>
          <input type='text' ref='search' onInput={this.onInput.bind(this)} onKeyDown={this.onKeyDown.bind(this)}/>
          <span className='index'>{this.state.index}</span>
        </div>
        <button className='fa fa-chevron-up button-up' disabled={this.state.disabled}/>
        <button className='fa fa-chevron-down button-up' disabled={this.state.disabled}/>
        <button className='fa fa-times button-close' onClick={this.onClickClose.bind(this)}/>
      </div>
    );
  }

  onClickClose() {
    this.action.close();
  }
}

class ActionCreator {
  close() {
    dispatcher.emit('closeFind');
  }

  search(text) {
    dispatcher.emit('search', text);
  }

  scrollToNext() {
    dispatcher.emit('next-mark');
  }
}

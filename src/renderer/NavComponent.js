import React from 'react'
import classnames from 'classnames'
import fileStore from './stores/file'
import navStore from './NavStore'
import dispatcher from './Dispatcher'
import ipc from 'ipc'

export default class NavComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: '',
    };

    fileStore.on('change', this.onFileChanged.bind(this));

    this.action = new ActionCreator();
  }

  render() {
    return (
      <div ref='nav' className='nav'>
        <button className='backward' disabled={this.state.disabled} onClick={this.action.backward}/>
        <button className='forward' disabled={this.state.disabled} onClick={this.action.forward}/>
        <button className='reload' disabled={this.state.disabled} onClick={this.action.reload}/>
        <input className='path' type='text' value={this.state.path} onChange={this.onChange.bind(this)} onKeyDown={this.onKeyDown.bind(this)}/>
        <button className='tools' onClick={this.action.toggleMenu}/>
      </div>
    );
  }

  onChange(e) {
    let input = e.currentTarget;
    let path = input.value;
    this.setState({path});
  }

  onKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        this.action.change(this.state.path);
        break;
    }
  }

  onFileChanged(file) {
    console.log('onFileChanged:', file.path);
    this.setState({path: file.path});
  }
}

class ActionCreator {
  backward() {
    dispatcher.emit('backward');
  }

  forward() {
    dispatcher.emit('forward');
  }

  reload() {
    dispatcher.emit('file-reloading');
  }

  change(path) {
    dispatcher.emit('file-changing', path);
  }

  toggleMenu() {
    dispatcher.emit('toggle-menu');
  }
}

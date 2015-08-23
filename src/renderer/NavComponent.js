import React from 'react'
import classnames from 'classnames'
import navStore from './NavStore'
import dispatcher from './Dispatcher'
import ipc from 'ipc'

export default class NavComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.action = new ActionCreator();
  }

  render() {
    return (
      <div ref='nav' className='nav'>
        <button className='backward' disabled={this.state.disabled} onClick={this.action.backward}/>
        <button className='forward' disabled={this.state.disabled} onClick={this.action.forward}/>
        <button className='reload' disabled={this.state.disabled} onClick={this.action.reload}/>
        <input className='uri' type='text' onSubmit={this.action.submit}/>
        <button className='tools' onClick={this.action.toggleMenu}/>
      </div>
    );
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
    ipc.send('reload');
  }

  submit() {
    dispatcher.emit('change-uri');
  }

  toggleMenu() {
    dispatcher.emit('toggle-menu');
  }
}

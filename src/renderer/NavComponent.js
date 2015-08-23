import React from 'react'
import classnames from 'classnames'
import dispatcher from './Dispatcher'
import navStore from './NavStore'

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
  }

  forward() {
  }

  reload() {
  }

  submit() {
  }

  toggleMenu() {
  }
}

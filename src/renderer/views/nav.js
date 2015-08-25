import React from 'react'
import classnames from 'classnames'
import fileStore from '../stores/file'
import historyAction from '../actions/history'
import menuAction from '../actions/menu'

export default class NavComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: '',
    };

    fileStore.on('change', this.onFileChanged.bind(this));
  }

  render() {
    return (
      <div ref='nav' className='nav'>
        <button className='backward' disabled={this.state.disabled} onClick={historyAction.backward}/>
        <button className='forward' disabled={this.state.disabled} onClick={historyAction.forward}/>
        <button className='reload' disabled={this.state.disabled} onClick={historyAction.reload}/>
        <input className='path' type='text' value={this.state.path} onChange={this.onChange.bind(this)} onKeyDown={this.onKeyDown.bind(this)}/>
        <button className='tools' onClick={menuAction.toggle}/>
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
        historyAction.change(this.state.path);
        break;
    }
  }

  onFileChanged(file) {
    console.log('onFileChanged:', file.path);
    this.setState({path: file.path});
  }
}

import React from 'react'
import classnames from 'classnames'
import Nav from './nav'
import Search from './search'
import Body from './body'
import windowStore from '../stores/window'
import appAction from '../actions/app'

export default class RootComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
    };

    windowStore.on('focus', this.onWindowFocus.bind(this));
    windowStore.on('blur', this.onWindowBlur.bind(this));
  }

  onWindowFocus() {
    this.setState({
      isFocused: true,
    });
  }

  onWindowBlur() {
    this.setState({
      isFocused: false,
    });
  }

  render() {
    return <div ref='root' className={classnames('root', {'is-focused': this.state.isFocused})}>
      <Nav/>
      <Search/>
      <Body/>
    </div>;
  }

  componentDidMount() {
    appAction.ready();
  }
}

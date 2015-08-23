import React from 'react'
import Nav from './NavComponent'
import Search from './SearchComponent'
import Body from './BodyComponent'
import windowStore from './windowStore'
import dispatcher from './Dispatcher'
import classnames from 'classnames'

export default class RootComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false,
    };

    windowStore.on('focus', this.onWindowFocus.bind(this));
    windowStore.on('blur', this.onWindowBlur.bind(this));

    this.action = new ActionCreator();
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
    this.action.ready();
  }
}

class ActionCreator {
  ready() {
    dispatcher.emit('ready');
  }
}

import React from 'react'
import classnames from 'classnames'
import Nav from './nav'
import Search from './search'

export default class RootComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className='head'>
      <Nav/>
      <Search/>
    </div>;
  }
}

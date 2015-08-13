import React from 'react'
import Search from './SearchComponent'
import Markdown from './MarkdownComponent'
import Rail from './RailComponent'

let $ = React.createElement;

export default class RootComponent extends React.Component {
  render() {
    return <div className="root">
      <div className="body">
        <Markdown/>
        <Rail/>
      </div>
      <Search/>
    </div>;
  }
}

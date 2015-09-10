import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Head from '../components/Head'
import Body from '../components/Body'
import * as MarknActions from '../actions/markn'

class App extends Component {
  render () {
    const { markdown, dispatch } = this.props
    const actions = bindActionCreators(MarknActions, dispatch)

    return (
      <div>
        <Header />
        <Body markdown={markdown} />
      </div>
    )
  }
}

App.propTypes = {
  markdown: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {
    markdown: state.markdown
  }
}

export default connect(mapStateToProps)(App)

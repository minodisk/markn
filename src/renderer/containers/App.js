import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import Header from '../components/Header'
// import MainSection from '../components/MainSection'
import Head from '../components/Head'
import Body from '../components/Body'
import * as MarknActions from '../actions/markn'

class App extends Component {
  render () {
    const { todos, dispatch } = this.props
    const actions = bindActionCreators(TodoActions, dispatch)

    return (
      <div>
        <Header addTodo={actions.addTodo} />
        <Body todos={todos} actions={actions} />
      </div>
    )
  }
}

App.propTypes = {
  todos: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {
    todos: state.todos
  }
}

export default connect(mapStateToProps)(App)

import { BACKWARD_HISTORY, FORWARD_HISTORY, RELOAD_HISTORY, CHANGE_HISTORY } from '../constants/ActionTypes'

export default function history (state = 0, action) {
  switch (action.type) {
  case BACKWARD_HISTORY:
    return state - 1
  case FORWARD_HISTORY:
    return state + 1
  default:
    return state
  }
}

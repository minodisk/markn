import * as types from '../constants/ActionTypes'

export const backwardHistory = () => { type: types.BACKWARD_HISTORY }
export const forwardHistory = () => { type: types.FORWARD_HISTORY }
export reloadHistory = () => { type: types.RELOAD_HISTORY }
export changeHistory = (path) => { type: types.CHANGE_HISTORY, path }

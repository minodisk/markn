import * as types from '../constants/ActionTypes'

export const backwardHistory = () => { type: types.BACKWARD_HISTORY }
export const forwardHistory = () => { type: types.FORWARD_HISTORY }
export const reloadHistory = () => { type: types.RELOAD_HISTORY }
export const changeHistory = (path) => { type: types.CHANGE_HISTORY, path }

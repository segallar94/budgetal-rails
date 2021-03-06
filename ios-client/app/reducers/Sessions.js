import {
  SESSION_UPDATED,
} from '../constants/ActionTypes'

const initialSessionState = {
	key: 'Sessions',
	sessions: {
    active: [],
    expired: []
  },
}

export default function sessionState(state = initialSessionState, action) {
	switch (action.type) {
  	case SESSION_UPDATED:
  		return {
  			...state,
        sessions: action.sessions,
  		}
    default:
  		return state
	}
}

import {FETCH_CHALLENGES_SUCCESS, CHANGE_CURRENT_DECK} from '../actions/index.js';

const defaultState = {
	decks: [],
	challenges: [],
	currentDeck: null,
	username: null,
};

export default (state = defaultState, action) => {
	console.dir(action);
	switch (action.type) {
		case FETCH_CHALLENGES_SUCCESS: {
			return {
				...state,
				challenges: action.challenges,
			};
		}
		case CHANGE_CURRENT_DECK: {
			return {
				...state,
				currentDeck: action.deck,
			};
		}
		default: {
			return state;
		}
	}
};

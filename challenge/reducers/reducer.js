import {
	FETCH_CHALLENGES_SUCCESS,
	CHANGE_CURRENT_DECK,
	FETCH_DECK_SUCCESS,
	SAVE_DECK,
} from '../actions/index.js';

const defaultState = {
	deck: null,
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
				deck: null,
				currentDeck: action.deck,
			};
		}
		case SAVE_DECK: {
			return {
				...state,
				decks: state.decks.map(d => d._id === action.deck._id ? action.deck : d),
				deck: state.deck._id === action.deck._id ? action.deck : state.deck,
			};
		}
		case FETCH_DECK_SUCCESS: {
			return {
				...state,
				deck: action.deck,
			};
		}
		default: {
			return state;
		}
	}
};

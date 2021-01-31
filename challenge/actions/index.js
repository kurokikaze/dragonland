/* globals window */
import fetch from 'cross-fetch';

export const CHANGE_CURRENT_DECK = 'actions/change_current_deck';
export const START_CHALLENGE = 'actions/start_challenge';

export const FETCH_CHALLENGES_START = 'actions/fetch_challenges_start';
export const FETCH_CHALLENGES_SUCCESS = 'actions/fetch_challenges_success';
export const FETCH_CHALLENGES_FAILURE = 'actions/fetch_challenges_failure';
export const FETCH_DECK_START = 'actions/fetch_deck_start';
export const FETCH_DECK_SUCCESS = 'actions/fetch_deck_success';
export const FETCH_DECK_FAILURE = 'actions/fetch_deck_failure';

export const SAVE_DECK = 'actions/deck_saved';

export const changeCurrentDeck = (deck) => ({type: CHANGE_CURRENT_DECK, deck});
export const startChallenge = (deck) => ({type: START_CHALLENGE, deck});
export const fetchChallengesStart = () => ({type: FETCH_CHALLENGES_START});
export const fetchChallengesSuccess = (challenges) => ({type: FETCH_CHALLENGES_SUCCESS, challenges});
export const fetchChallengesFailure = () => ({type: FETCH_CHALLENGES_FAILURE});
export const fetchDeckStart = () => ({type: FETCH_DECK_START});
export const fetchDeckSuccess = (deck) => ({type: FETCH_DECK_SUCCESS, deck});
export const fetchDeckFailure = () => ({type: FETCH_DECK_FAILURE});
export const saveDeck = (deck) => ({type: SAVE_DECK, deck});

const toJSON = response => response.json();

export function fetchChallenges() {
	return function (dispatch) {
		dispatch(fetchChallengesStart());
  
		return fetch('/api/challenges')
			.then(toJSON)
			.then(json =>{
				if (json.length) {
					dispatch(fetchChallengesSuccess(json));
				}
				if (json.hash) {
					window.location.assign(`/api/game/${json.hash}`);
				}
			});
	};
}

export function fetchDeck(deckId) {
	return function (dispatch) {
		dispatch(fetchDeckStart());
  
		return fetch(`/api/deck/${deckId}`)
			.then(toJSON)
			.then(json =>{
				dispatch(fetchDeckSuccess(json));
			});
	};
}

export function createChallenge(deckId) {
	return function (dispatch) {
		dispatch(startChallenge());
  
		return fetch('/api/challenges', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({deckId}),
		})
			.then(toJSON)
			.then(json => {
				if (Array.isArray(json)) {
					dispatch(fetchChallengesSuccess(json));
				}
			});
	};
}

export function acceptChallenge(name, deckId) {
	return function (dispatch) {
		return fetch('/api/accept', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({name, deckId}),
		})
			.then(toJSON)
			.then(json => {
				if (Array.isArray(json)) {
					dispatch(fetchChallengesSuccess(json));
				}
				if (json.hash) {
					window.location.assign(`/api/game/${json.hash}`);
				}
			});
	};
}

export function cancelChallenge() {
	return function (dispatch) {
		return fetch('/api/cancel', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: '{}',
		})
			.then(toJSON)
			.then(json => {
				if (Array.isArray(json)) {
					dispatch(fetchChallengesSuccess(json));
				}
				if (json.hash) {
					window.location.assign(`/api/game/${json.hash}`);
				}
			});
	};
}

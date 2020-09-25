/* globals window */
import fetch from 'cross-fetch';

export const CHANGE_CURRENT_DECK = 'actions/change_current_deck';
export const START_CHALLENGE = 'actions/start_challenge';

export const FETCH_CHALLENGES_START = 'actions/fetch_challenges_start';
export const FETCH_CHALLENGES_SUCCESS = 'actions/fetch_challenges_success';
export const FETCH_CHALLENGES_FAILURE = 'actions/fetch_challenges_failure';

export const changeCurrentDeck = (deck) => ({type: CHANGE_CURRENT_DECK, deck});
export const startChallenge = (deck) => ({type: START_CHALLENGE, deck});
export const fetchChallengesStart = () => ({type: FETCH_CHALLENGES_START});
export const fetchChallengesSuccess = (challenges) => ({type: FETCH_CHALLENGES_SUCCESS, challenges});
export const fetchChallengesFailure = () => ({type: FETCH_CHALLENGES_FAILURE});

export function fetchChallenges() {
	return function (dispatch) {
		dispatch(fetchChallengesStart());
  
		return fetch('/api/challenges')
			.then(
				response => response.json()
			)
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
			.then(
				response => response.json()
			)
			.then(json =>
				dispatch(fetchChallengesSuccess(json))
			);
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
			.then(
				response => response.json()
			)
			.then(json => {
				if (json.length) {
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
			.then(
				response => response.json(),
			)
			.then(json => {
				if (json.length) {
					dispatch(fetchChallengesSuccess(json));
				}
				if (json.hash) {
					window.location.assign(`/api/game/${json.hash}`);
				}
			});
	};
}
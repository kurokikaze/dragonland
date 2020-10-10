/* global window */
import {pathOr} from 'ramda';
import {
	STEP_PRS_FIRST,
	STEP_PRS_SECOND,
} from '../const.js';

import {cards} from 'moonlands/src/cards';

import {
	TYPE_RELIC,
} from 'moonlands/src/const.js';

const relicsHash = {};

cards.forEach(card => {
	if (card.type === TYPE_RELIC) {
		relicsHash[card.name] = true;
	}
});

export function isOurTurn(state) {
	return state.activePlayer === window.playerId;
}

export function isPromptActive(state) {
	return state.prompt && state.promptPlayer === window.playerId;
}

export function getPromptType(state) {
	return state.prompt ? state.promptType : null;
}

export function getMagiEnergy(state) {
	return zoneContent('playerActiveMagi', state).length ? zoneContent('playerActiveMagi', state)[0].data.energy : 0;
}

const isRelic = card => relicsHash[card.card];
const isNotRelic = card => !relicsHash[card.card];

export function zoneContent(zoneId, state) {
	switch (zoneId) {
		case 'playerRelics': {
			return pathOr([], ['zones', 'playerInPlay'], state).filter(isRelic);
		}
		case 'playerInPlay': {
			return pathOr([], ['zones', 'playerInPlay'], state).filter(isNotRelic);
		}
		case 'opponentRelics': {
			return pathOr([], ['zones', 'opponentInPlay'], state).filter(isRelic);
		}
		case 'opponentInPlay': {
			return pathOr([], ['zones', 'opponentInPlay'], state).filter(isNotRelic);
		}
		default: {
			return pathOr([], ['zones', zoneId], state);
		}
	}
}

export function getAvailableStartingCards(cards = [], state) {
	const discardCards = state.zones.playerDiscard.map(card => card.card);
	const libraryCards = state.zones.playerDeck.map(card => card.card);
	const searchableCards = [...discardCards, ...libraryCards];
	return cards.filter(card => searchableCards.includes(card));
}

export const isPRSAvailable = state => state.activePlayer == window.playerId && [STEP_PRS_FIRST, STEP_PRS_SECOND].includes(state.step);
/* global window */
import pathOr from 'ramda/src/pathOr';
import {
	STEP_PRS_FIRST,
	STEP_PRS_SECOND,
} from '../const.js';

import {cards} from 'moonlands/dist/cards';

import {
	TYPE_RELIC,
} from 'moonlands/dist/const';

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

export const getActivePlayerMagi = state => state.zones.playerActiveMagi[0];
export const getPromptCards = state => state.promptParams.cards;
export const getAvailableCards = state => state.promptParams.availableCards;
export const getPromptGeneratedBy = state => state.promptGeneratedBy;
export const getPromptNumberOfCards = state => state.promptParams.numberOfCards;
export const getPromptMin = state => state.promptParams.min || 1;
export const getPromptMax = state => state.promptParams.max;
export const getCards = state => state.promptParams.cards;
export const getPromptZone = state => state.promptParams.zone;
export const getPromptZoneOwner = state => state.promptParams.zoneOwner;
export const getPromptMessage = state => state.promptParams.message;
export const getPromptType = (state) => state.prompt ? state.promptType : null;

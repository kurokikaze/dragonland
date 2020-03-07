/* global window */
import {pathOr} from 'ramda';

export function isOurTurn(state) {
	return state.activePlayer === window.playerId;
}

export function isPromptActive(state) {
	return state.prompt && state.promptPlayer === window.playerId;
}

export function getMagiEnergy(state) {
	return zoneContent('playerActiveMagi', state).length ? zoneContent('playerActiveMagi', state)[0].data.energy : 0;
}

export function zoneContent(zoneId, state) {
	return pathOr([], ['zones', zoneId], state);
}

export function getAvailableStartingCards(cards = [], state) {
	const discardCards = state.zones.playerDiscard.map(card => card.card);
	const libraryCards = state.zones.playerDeck.map(card => card.card);
	const searchableCards = [...discardCards, ...libraryCards];
	return cards.filter(card => searchableCards.includes(card));
}

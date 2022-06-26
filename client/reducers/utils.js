/* global window */
import {
	ZONE_TYPE_ACTIVE_MAGI,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_DEFEATED_MAGI,
	ZONE_TYPE_DECK,
	ZONE_TYPE_DISCARD,
	ZONE_TYPE_HAND,
	ZONE_TYPE_IN_PLAY,
} from 'moonlands/dist/const.js';

const clientZoneNames = {
	[ZONE_TYPE_DECK]: 'Deck',
	[ZONE_TYPE_HAND]: 'Hand',
	[ZONE_TYPE_DISCARD]: 'Discard',
	[ZONE_TYPE_ACTIVE_MAGI]: 'ActiveMagi',
	[ZONE_TYPE_MAGI_PILE]: 'MagiPile',
	[ZONE_TYPE_DEFEATED_MAGI]: 'DefeatedMagi',
	[ZONE_TYPE_IN_PLAY]: 'InPlay',
};

export const findInPlay = (state, id) => {
	const cardPlayerInPlay = state.zones.inPlay.find(card => card.id === id);
	if (cardPlayerInPlay) return cardPlayerInPlay;

	const cardPlayerMagi = state.zones.playerActiveMagi.find(card => card.id === id);
	if (cardPlayerMagi) return cardPlayerMagi;

	const cardOpponentMagi = state.zones.opponentActiveMagi.find(card => card.id === id);
	if (cardOpponentMagi) return cardOpponentMagi;

	return null;
};

export const getZoneName = (serverZoneType, source) => {
	if (!clientZoneNames[serverZoneType]) {
		throw new Error(`Unknown zone: ${serverZoneType}`);
	}

	if (serverZoneType === ZONE_TYPE_IN_PLAY) {
		return 'inPlay';
	}
	const zonePrefix = source.owner === window.playerId ? 'player' : 'opponent';
	const zoneName = clientZoneNames[serverZoneType];
	return `${zonePrefix}${zoneName}`;
};

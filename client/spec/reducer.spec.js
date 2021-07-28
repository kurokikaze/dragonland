/* global describe, it, expect, window */
import simpleReducer from '../reducers/reducer.js';
import {
	ACTION_EFFECT,

	EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,

	ZONE_TYPE_ACTIVE_MAGI,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_DEFEATED_MAGI,
	ZONE_TYPE_HAND,
	ZONE_TYPE_IN_PLAY,
} from 'moonlands/dist/const';

const defaultState = () => ({
	zones: {
		playerHand: [],
		playerDeck: [],
		playerDiscard: [],
		playerActiveMagi: [],
		playerMagiPile: [],
		playerDefeatedMagi: [],
		inPlay: [],
		opponentHand: [],
		opponentDeck: [],
		opponentDiscard: [],
		opponentActiveMagi: [],
		opponentMagiPile: [],
		opponentDefeatedMagi: [],
	},
	staticAbilities: [],
	animation: null,
	message: {
		type: 'power',
		source: 'TestSource',
		power: {
			name: 'Power Name',
		},
	},
	gameEnded: false,
	winner: null,
	packs: [],
});

describe('Separating static abilities into state property', () => {
	it('Static abilities are added correctly', () => {
		const ACTIVE_PLAYER = 12;
		window.playerId = ACTIVE_PLAYER;
		const state = {
			...defaultState(),
			zones: {
				...defaultState().zones,
				playerMagiPile: [{
					id: 'testcard',
				}],
			},
		};

		const action = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
			sourceZone: ZONE_TYPE_MAGI_PILE,
			destinationZone: ZONE_TYPE_ACTIVE_MAGI,
			sourceCard: {
				id: 'testcard',
				owner: ACTIVE_PLAYER,
			},
			destinationCard: {
				id: 'testcard2',
				card: 'Yaki',
				owner: ACTIVE_PLAYER,
			},
		};

		const resultingState = simpleReducer(state, action);
		expect(resultingState.staticAbilities.length).toEqual(1, 'One new static ability added');
		expect(resultingState.staticAbilities[0].card.data.staticAbilities.length).toEqual(1, 'Card data is included in static ability store');
	});

	it('Static abilities are removed correctly', () => {
		const ACTIVE_PLAYER = 12;
		window.playerId = ACTIVE_PLAYER;
		const state = {
			...defaultState(),
			zones: {
				...defaultState().zones,
				playerMagiPile: [{
					id: 'testcard',
				}],
			},
		};

		const action = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
			sourceZone: ZONE_TYPE_MAGI_PILE,
			destinationZone: ZONE_TYPE_ACTIVE_MAGI,
			sourceCard: {
				id: 'testcard',
				owner: ACTIVE_PLAYER,
			},
			destinationCard: {
				id: 'testcard2',
				card: 'Yaki',
				owner: ACTIVE_PLAYER,
			},
		};

		const resultingState = simpleReducer(state, action);
		expect(resultingState.staticAbilities.length).toEqual(1, 'One new static ability added');
		expect(resultingState.staticAbilities[0].card.data.staticAbilities.length).toEqual(1, 'Card data is included in static ability store');

		const removingAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
			sourceZone: ZONE_TYPE_ACTIVE_MAGI,
			destinationZone: ZONE_TYPE_DEFEATED_MAGI,
			sourceCard: {
				id: 'testcard2',
				card: 'Yaki',
				owner: ACTIVE_PLAYER,
			},
			destinationCard: {
				id: 'testcard3',
				card: 'Yaki',
				owner: ACTIVE_PLAYER,
			},
		};

		const thirdState = simpleReducer(resultingState, removingAction);
		expect(thirdState.staticAbilities.length).toEqual(0, 'Static ability is removed if card has moved out');
	});

	it('Static abilities of relics are added correctly', () => {
		const ACTIVE_PLAYER = 12;
		window.playerId = ACTIVE_PLAYER;
		const state = {
			...defaultState(),
			zones: {
				...defaultState().zones,
				playerHand: [{
					id: 'testcard',
					card: 'Water of Life',
				}],
			},
		};

		const action = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
			sourceZone: ZONE_TYPE_HAND,
			destinationZone: ZONE_TYPE_IN_PLAY,
			sourceCard: {
				id: 'testcard',
				owner: ACTIVE_PLAYER,
			},
			destinationCard: {
				id: 'testcard2',
				card: 'Water of Life',
				owner: ACTIVE_PLAYER,
			},
		};

		const resultingState = simpleReducer(state, action);
		expect(resultingState.staticAbilities.length).toEqual(1, 'One new static ability added');
		expect(resultingState.staticAbilities[0].card.data.staticAbilities.length).toEqual(1, 'Card data is included in static ability store');
	});

	it('Static abilities are not added if they are not needed', () => {
		const ACTIVE_PLAYER = 12;
		window.playerId = ACTIVE_PLAYER;
		const state = {
			...defaultState(),
			zones: {
				...defaultState().zones,
				playerMagiPile: [{
					id: 'testcard',
				}],
			},
		};

		const action = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
			sourceZone: ZONE_TYPE_MAGI_PILE,
			destinationZone: ZONE_TYPE_ACTIVE_MAGI,
			sourceCard: {
				id: 'testcard',
				owner: ACTIVE_PLAYER,
			},
			destinationCard: {
				id: 'testcard2',
				card: 'Lasada',
				owner: ACTIVE_PLAYER,
			},
		};

		const resultingState = simpleReducer(state, action);
		expect(resultingState.staticAbilities.length).toEqual(0, 'No static abilities added if the card doesnt have them');
	});
});
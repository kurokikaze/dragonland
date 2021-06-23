/* global expect, describe, it */
import {byName} from 'moonlands/dist/cards';
import {mapCardDataFromProps, transformCard} from '../common.js';

describe('Common code from components', () => {
	it('Fetches card by id from zones', () => {
		const defaultState = {
			zones: {
				playerHand: [
					{
						id: 1,
					},
					{
						id: 2,
					},
				],
				playerDeck: [
					{
						id: 3,
					},
					{
						id: 4,
					},
				],
				playerDiscard: [],
				playerActiveMagi: [
					{
						id: 5,
					},
				],
				playerMagiPile: [
					{
						id: 6,
					},
					{
						id: 7,
						name: 'found',
					},
				],
				playerDefeatedMagi: [],
				playerInPlay: [
					{
						id: 8,
					},
				],
				opponentHand: [],
				opponentDeck: [],
				opponentDiscard: [],
				opponentActiveMagi: [],
				opponentMagiPile: [],
				opponentDefeatedMagi: [],
				opponentInPlay: [],
			},
			message: null,
			gameEnded: false,
			winner: null,
		};

		const transformedState = mapCardDataFromProps(defaultState, {id: 7});

		expect(transformedState).toEqual({
			card: {
				id: 7,
				name: 'found',
			},
		});
	});
});

describe('cardDataTransformer', () => {
	it('Static abilities - Double Strike', () => {
		const TEST_PLAYER_ONE = 12;

		const testStaticAbilities = [
			{
				id: 'static1',
				card: byName('Yaki'),
				data: {
					controller: TEST_PLAYER_ONE,
				},
				owner: TEST_PLAYER_ONE,
			},
		];

		const testCard = {
			id: 'card1',
			card: 'Arboll',
			data: {
				controller: TEST_PLAYER_ONE,
			},
		};

		const resultingCard = transformCard(testStaticAbilities)(testCard);
		expect(resultingCard.card.data.attacksPerTurn).toEqual(1, 'Arbolls original data shows 1 attack per turn');
		expect(resultingCard.modifiedData.attacksPerTurn).toEqual(2, 'Arboll now has 2 attacks per turn, modified by Yaki static ability');
	});

	it('Static abilities - Invigorate', () => {
		const TEST_PLAYER_ONE = 14;

		const testStaticAbilities = [
			{
				id: 'static1',
				card: byName('Water of Life'),
				data: {
					controller: TEST_PLAYER_ONE,
				},
				owner: TEST_PLAYER_ONE,
			},
		];

		const testCard = {
			id: 'card1',
			card: 'Grega',
			data: {
				controller: TEST_PLAYER_ONE,
			},
		};

		const resultingCard = transformCard(testStaticAbilities)(testCard);

		expect(resultingCard.modifiedData.energize).toEqual(6, 'Grega energize rate modified by Water of Life is 6');
		expect(resultingCard.card.data.energize).toEqual(5, 'Grega original energize rate is still 5');
	});

	it('Static abilities - none', () => {
		const TEST_PLAYER_ONE = 12;

		const testStaticAbilities = [];

		const testCard = {
			id: 'card1',
			card: 'Arboll',
			data: {
				controller: TEST_PLAYER_ONE,
			},
		};

		const resultingCard = transformCard(testStaticAbilities)(testCard);
		expect(resultingCard.modifiedData.attacksPerTurn).toEqual(1, 'Arboll has 1 attack per turn,  not modified by anything');
	});

	it('Static abilities - none (Stagadan)', () => {
		const TEST_PLAYER_ONE = 12;

		const testStaticAbilities = [];

		const testCard = {
			id: 'card1',
			card: 'Stagadan',
			data: {
				controller: TEST_PLAYER_ONE,
			},
		};

		const transformedCard = transformCard(testStaticAbilities)(testCard);
		expect(transformedCard.modifiedData.attacksPerTurn).toEqual(1, 'Stagadan has 1 attack per turn,  not modified by anything');
	});
});

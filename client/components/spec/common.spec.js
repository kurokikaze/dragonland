/* global expect, describe, it */

import {mapCardDataFromProps} from '../common.js';

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
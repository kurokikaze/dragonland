/* global describe, it, expect */
import { getCardDetails } from '../components/common.js';

import {
	PROPERTY_CONTROLLER,
	SELECTOR_ID,
	CALCULATION_SET,
} from 'moonlands/dist/const';

describe('Selectors', () => {
	const ACTIVE_PLAYER = 22;
	const OPPONENT = 32;

	it('Static abilities affecting cards', () => {
		const initialState = {
			zones: {
				inPlay: [
					{
						id: 'testId',
						card: 'Arbolit',
						data: {
							controller: ACTIVE_PLAYER,
							owner: ACTIVE_PLAYER,
						}
					}
				],
				activePlayerMagi: [],
				opponentActiveMagi: [],
			},
			continuousEffects: [
				{
					staticAbilities: [
						{
							name: 'Test control ability',
							text: 'Control change ability',
							selector: SELECTOR_ID,
							selectorParameter: 'testId', 
							property: PROPERTY_CONTROLLER,
							modifier: {
								operator: CALCULATION_SET,
								operandOne: OPPONENT,
							},
						}
					]
				}
			]
		};

		const result = getCardDetails(initialState);
		expect(initialState.zones.inPlay[0].data.controller).toEqual(ACTIVE_PLAYER);
		expect(result.inPlay[0].data.controller).toEqual(OPPONENT);

		expect(result.inPlay[0].data.affectedBy).toHaveLength(1);

		expect(result.inPlay[0].data.affectedBy[0].name).toEqual('Test control ability');
		expect(result.inPlay[0].data.affectedBy[0].text).toEqual('Control change ability');
	});

	it('Correct application of layers', () => {
		const initialState = {
			zones: {
				inPlay: [
					{
						id: 'testId',
						card: 'Sea Barl',
						data: {
							controller: ACTIVE_PLAYER,
							owner: ACTIVE_PLAYER,
						}
					},
					{
						id: 'testIdRelic',
						card: 'Orothean Gloves',
						data: {
							controller: ACTIVE_PLAYER,
							owner: ACTIVE_PLAYER,
						}
					},
				],
				activePlayerMagi: [],
				opponentActiveMagi: [],
			},
			continuousEffects: [
				{
					staticAbilities: [
						{
							name: 'Test control ability',
							text: 'Control change ability',
							selector: SELECTOR_ID,
							selectorParameter: 'testId', 
							property: PROPERTY_CONTROLLER,
							modifier: {
								operator: CALCULATION_SET,
								operandOne: OPPONENT,
							},
						}
					]
				}
			]
		};

		const result = getCardDetails(initialState);
		expect(initialState.zones.inPlay[0].data.controller).toEqual(ACTIVE_PLAYER);
		expect(result.inPlay[0].data.controller).toEqual(OPPONENT);
		expect(result.inPlay[0].data.affectedBy).toHaveLength(2);

		expect(result.inPlay[0].data.affectedBy[1].name).toEqual('Test control ability');
		expect(result.inPlay[0].data.affectedBy[1].text).toEqual('Control change ability');

		expect(result.inPlay[0].data.affectedBy[0].name).toEqual('Empower');
		expect(result.inPlay[0].data.affectedBy[0].text).toEqual('Powers on Creatures you control cost one less to a minimum of one');
	});

	it('Game statis abilities', () => {
		const initialState = {
			zones: {
				inPlay: [
					{
						id: 'testId',
						card: 'Korrit',
						data: {
							controller: ACTIVE_PLAYER,
							owner: ACTIVE_PLAYER,
							burrowed: true,
						},
					},
				],
				activePlayerMagi: [],
				opponentActiveMagi: [],
			},
			continuousEffects: [],
		};

		const result = getCardDetails(initialState);
		expect(result.inPlay[0].card.data.energyLossThreshold).toEqual(2);
		expect(result.inPlay[0].card.data.ableToAttack).toEqual(false);
		expect(result.inPlay[0].data.affectedBy).toHaveLength(2);

		expect(result.inPlay[0].data.affectedBy[0].name).toEqual('Burrowed - Energy loss');
		expect(result.inPlay[0].data.affectedBy[0].text).toEqual('Your burrowed creatures cannot lose more than 2 energy each turn');

		expect(result.inPlay[0].data.affectedBy[1].name).toEqual('Burrowed - Ability to attack');
		expect(result.inPlay[0].data.affectedBy[1].text).toEqual('Your burrowed creatures cannot attack');
	});
});
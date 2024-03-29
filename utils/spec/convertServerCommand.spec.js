/* global expect, describe, it */

import {State} from 'moonlands';
import CardInGame from 'moonlands/src/classes/CardInGame.ts';
import Zone from 'moonlands/src/classes/Zone.ts';

import {
	ACTION_PASS,
	ACTION_ENTER_PROMPT,
	ACTION_RESOLVE_PROMPT,
	ACTION_POWER,
	ACTION_EFFECT,

	EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
	EFFECT_TYPE_PAYING_ENERGY_FOR_POWER,
	EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,
	EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL,
	EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
	EFFECT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES,
	EFFECT_TYPE_DISCARD_RESHUFFLED,

	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_NUMBER,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
	PROMPT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES,

	RESTRICTION_TYPE,
	RESTRICTION_REGION,

	TYPE_CREATURE,

	REGION_CALD,

	ZONE_TYPE_HAND,
	ZONE_TYPE_DECK,
	ZONE_TYPE_DISCARD,
	ZONE_TYPE_ACTIVE_MAGI,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_DEFEATED_MAGI,
	ZONE_TYPE_IN_PLAY,
} from 'moonlands/dist/const';

/* eslint-disable no-unused-vars */
const STEP_ENERGIZE = 0;
const STEP_PRS_FIRST = 1;
const STEP_ATTACK = 2;
const STEP_CREATURES = 3;
const STEP_PRS_SECOND = 4;
const STEP_DRAW = 5;
/* eslint-enable no-unused-vars */

import {byName} from 'moonlands/dist/cards';
import convert from '../convertServerCommand';

const createZones = (player1, player2, creatures = [], activeMagi = []) => [
	new Zone('Player 1 hand', ZONE_TYPE_HAND, player1),
	new Zone('Player 2 hand', ZONE_TYPE_HAND, player2),
	new Zone('Player 1 deck', ZONE_TYPE_DECK, player1),
	new Zone('Player 2 deck', ZONE_TYPE_DECK, player2),
	new Zone('Player 1 discard', ZONE_TYPE_DISCARD, player1),
	new Zone('Player 2 discard', ZONE_TYPE_DISCARD, player2),
	new Zone('Player 1 active magi', ZONE_TYPE_ACTIVE_MAGI, player1).add(activeMagi),
	new Zone('Player 2 active magi', ZONE_TYPE_ACTIVE_MAGI, player2),
	new Zone('Player 1 Magi pile', ZONE_TYPE_MAGI_PILE, player1),
	new Zone('Player 2 Magi pile', ZONE_TYPE_MAGI_PILE, player2),
	new Zone('Player 1 defeated Magi', ZONE_TYPE_DEFEATED_MAGI, player1),
	new Zone('Player 2 defeated Magi', ZONE_TYPE_DEFEATED_MAGI, player2),
	new Zone('In play', ZONE_TYPE_IN_PLAY, null).add(creatures),
];

describe('ACTION_PASS', () => {
	it('Adds next step', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [yaki]),
			step: STEP_PRS_SECOND,
			activePlayer: ACTIVE_PLAYER,
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_PASS,
			player: ACTIVE_PLAYER,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		expect(convertedAction.type).toEqual(ACTION_PASS, 'Type is passed as is');
		expect(convertedAction.player).toEqual(ACTIVE_PLAYER, 'Type is passed as is');
		expect(convertedAction.newStep).toEqual(STEP_DRAW, 'Next step is STEP_DRAW');
	});

	it('Adds next step (from DRAW to ENERGIZE)', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [yaki]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_PASS,
			player: ACTIVE_PLAYER,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		expect(convertedAction.type).toEqual(ACTION_PASS, 'Type is passed as is');
		expect(convertedAction.player).toEqual(ACTIVE_PLAYER, 'Type is passed as is');
		expect(convertedAction.newStep).toEqual(STEP_ENERGIZE, 'Next step is STEP_ENERGIZE');
	});
});

describe('ACTION_RESOLVE_PROMPT', () => {
	it('Passes unchanged', () => {
		const ACTIVE_PLAYER = 41;
		const NON_ACTIVE_PLAYER = 59;

		const initialAction = {
			type: ACTION_RESOLVE_PROMPT,
			generatedBy: 'test',
			number: 12,
			player: ACTIVE_PLAYER,
		};

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [], []),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
			spellMetaData: {},
		});

		const convertedAction = convert(initialAction, gameState, ACTIVE_PLAYER);

		expect(convertedAction).toEqual(initialAction);
	});
});

describe('ACTION_ENTER_PROMPT', () => {
	it('Message templating', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [yaki]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
			spellMetaData: {
				[weebo.id]: {
					rollResult: 12,
				},
			},
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_ENTER_PROMPT,
			message: 'Roll result is ${rollResult}',
			promptType: PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
			source: weebo,
			generatedBy: weebo.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		expect(convertedAction.message).toEqual('Roll result is 12', 'Message is templated correctly');
	});

	it('PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [yaki]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_ENTER_PROMPT,
			promptType: PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
			source: weebo,
			generatedBy: weebo.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedSource = {
			id: weebo.id,
			owner: weebo.owner,
			card: 'Weebo',
			data: {
				...weebo.data,
			},
		};
		expect(convertedAction.type).toEqual(ACTION_ENTER_PROMPT, 'Type is passed as is');
		expect(convertedAction.promptType).toEqual(PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE, 'Prompt type is passed as is');
		expect(convertedAction.source).toEqual(convertedSource, 'Source card is converted correctly');
	});

	it('PROMPT_TYPE_NUMBER', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const TEST_MAX_VALUE = 12;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [yaki]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
			spellMetaData: {
				[weebo.id]: {
					rollResult: TEST_MAX_VALUE,
				},
			},		
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_ENTER_PROMPT,
			promptType: PROMPT_TYPE_NUMBER,
			source: weebo,
			min: 1,
			max: '$rollResult',
			generatedBy: weebo.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedSource = {
			id: weebo.id,
			owner: weebo.owner,
			card: 'Weebo',
			data: {
				...weebo.data,
			},
		};
		expect(convertedAction.type).toEqual(ACTION_ENTER_PROMPT, 'Type is passed as is');
		expect(convertedAction.promptType).toEqual(PROMPT_TYPE_NUMBER, 'Prompt type is passed as is');
		expect(convertedAction.source).toEqual(convertedSource, 'Source card is converted correctly');
		expect(convertedAction.min).toEqual(1, 'Min value is passed correctly');
		expect(convertedAction.max).toEqual(TEST_MAX_VALUE, 'Max value is passed correctly');
	});

	it('PROMPT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const TEST_AMOUNT = 11;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [yaki]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
			spellMetaData: {
				[weebo.id]: {
					amountToDistribute: TEST_AMOUNT,
				},
			},		
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_ENTER_PROMPT,
			promptType: PROMPT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES,
			source: weebo,
			amount: '$amountToDistribute',
			generatedBy: weebo.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedSource = {
			id: weebo.id,
			owner: weebo.owner,
			card: 'Weebo',
			data: {
				...weebo.data,
			},
		};
		expect(convertedAction.type).toEqual(ACTION_ENTER_PROMPT, 'Type is passed as is');
		expect(convertedAction.promptType).toEqual(PROMPT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES, 'Prompt type is passed as is');
		expect(convertedAction.source).toEqual(convertedSource, 'Source card is converted correctly');
		expect(convertedAction.amount).toEqual(TEST_AMOUNT, 'Amount value is passed correctly');
	});

	it('PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);

		const kelthet = new CardInGame(byName('Kelthet'), ACTIVE_PLAYER);
		const thermalBlast = new CardInGame(byName('Thermal Blast'), ACTIVE_PLAYER);
		const waterOfLife = new CardInGame(byName('Water of Life'), ACTIVE_PLAYER);
		const quorPup = new CardInGame(byName('Quor Pup'), ACTIVE_PLAYER);
		const seaBarl = new CardInGame(byName('Sea Barl'), ACTIVE_PLAYER);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});
		gameState.getZone(ZONE_TYPE_DECK, ACTIVE_PLAYER).add([kelthet, thermalBlast, waterOfLife, quorPup, seaBarl]);

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_ENTER_PROMPT,
			promptType: PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
			zone: ZONE_TYPE_DECK,
			zoneOwner: ACTIVE_PLAYER,
			player: ACTIVE_PLAYER,
			restrictions: [
				{
					type: RESTRICTION_TYPE,
					value: TYPE_CREATURE,
				},
				{
					type: RESTRICTION_REGION,
					value: REGION_CALD,
				}				
			],
			generatedBy: grega.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		expect(convertedAction.cards.length).toEqual(2, 'Only 2 cards fit the restriction');
		expect(convertedAction.cards[0].card).toEqual('Kelthet', 'First is Kelthet');
		expect(convertedAction.cards[0].id).toEqual(kelthet.id, 'Kelthet id is preserved');
		expect(convertedAction.cards[0].data).toEqual(kelthet.data, 'Kelthet data is preserved');

		expect(convertedAction.cards[1].card).toEqual('Quor Pup', 'Second is Quor Pup');
		expect(convertedAction.cards[1].id).toEqual(quorPup.id, 'Quor Pup id is preserved');
		expect(convertedAction.cards[1].data).toEqual(quorPup.data, 'Quor Pup data is preserved');
	});
});

describe('ACTION_POWER', () => {
	it('Creature power', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const TEST_MAX_VALUE = 12;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
			spellMetaData: {
				[weebo.id]: {
					rollResult: TEST_MAX_VALUE,
				},
			},		
		});

		const serverAction = {
			type: ACTION_POWER,
			source: weebo,
			power: weebo.card.data.powers[0],
			generatedBy: weebo.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedSource = {
			id: weebo.id,
			owner: weebo.owner,
			card: 'Weebo',
			data: {
				...weebo.data,
			},
		};

		expect(convertedAction.type).toEqual(ACTION_POWER, 'Action type is correct');
		expect(convertedAction.source).toEqual(convertedSource, 'Source card is converted correctly');
		expect(convertedAction.generatedBy).toEqual(weebo.id, 'Power source id is preserved');
		expect(convertedAction.power).toEqual('Vitalize', 'Power is converted to power name');
	});

	it('Magi power', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const TEST_MAX_VALUE = 12;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
			spellMetaData: {
				[weebo.id]: {
					rollResult: TEST_MAX_VALUE,
				},
			},		
		});

		const serverAction = {
			type: ACTION_POWER,
			owner: grega.owner,
			source: grega,
			power: grega.card.data.powers[0],
			generatedBy: grega.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedSource = {
			id: grega.id,
			owner: grega.owner,
			card: 'Grega',
			data: {
				...grega.data,
			},
		};

		expect(convertedAction.type).toEqual(ACTION_POWER, 'Action type is correct');
		expect(convertedAction.source).toEqual(convertedSource, 'Source card is converted correctly');
		expect(convertedAction.generatedBy).toEqual(grega.id, 'Power source id is preserved');
		expect(convertedAction.power).toEqual('Thermal Blast', 'Power is converted to power name');
	});
});

describe('ACTION_EFFECT', () => {
	it('EFFECT_TYPE_ADD_ENERGY_TO_MAGI', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		const serverAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
			target: grega,
			amount: 4,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedTarget = {
			id: grega.id,
			owner: grega.owner,
			card: 'Grega',
			data: grega.data,
		};

		expect(convertedAction.type).toEqual(ACTION_EFFECT, 'Action type is correct');
		expect(convertedAction.effectType).toEqual(EFFECT_TYPE_ADD_ENERGY_TO_MAGI, 'Effect type is correct');
		expect(convertedAction.target).toEqual(convertedTarget, 'Target is converted correctly');
		expect(convertedAction.amount).toEqual(4, 'Amount is passed correctly');
	});

	it('EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const previousWeebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		gameState.getZone(ZONE_TYPE_HAND, ACTIVE_PLAYER).add([weebo]);

		const serverAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
			sourceCard: previousWeebo,
			sourceZone: ZONE_TYPE_IN_PLAY,
			destinationCard: weebo,
			destinationZone: ZONE_TYPE_HAND,
			generatedBy: grega.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedSourceCard = {
			id: previousWeebo.id,
			owner: grega.owner,
			card: 'Weebo',
			data: previousWeebo.data,
		};

		const convertedDestinationCard = {
			id: weebo.id,
			owner: grega.owner,
			card: 'Weebo',
			data: weebo.data,
		};

		expect(convertedAction.type).toEqual(ACTION_EFFECT, 'Action type is correct');
		expect(convertedAction.effectType).toEqual(EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES, 'Effect type is correct');
		expect(convertedAction.sourceCard).toEqual(convertedSourceCard, 'Source card is converted correctly');
		expect(convertedAction.sourceZone).toEqual(ZONE_TYPE_IN_PLAY, 'Source zonee is passed');
		expect(convertedAction.destinationCard).toEqual(convertedDestinationCard, 'Destination card is converted correctly');
		expect(convertedAction.destinationZone).toEqual(ZONE_TYPE_HAND, 'Destination zonee is passed');
	});

	it('EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES (masking cards in hidden zones)', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weeboInDeck = new CardInGame(byName('Weebo'), ACTIVE_PLAYER);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		gameState.getZone(ZONE_TYPE_HAND, ACTIVE_PLAYER).add([weebo]);

		const serverAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
			sourceCard: weeboInDeck,
			sourceZone: ZONE_TYPE_DECK,
			destinationCard: weebo,
			destinationZone: ZONE_TYPE_HAND,
			generatedBy: grega.id,
		};

		const convertedActionForActivePlayer = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedSourceCard = {
			id: weeboInDeck.id,
			owner: grega.owner,
			card: 'Weebo',
			data: weeboInDeck.data,
		};

		const convertedDestinationCard = {
			id: weebo.id,
			owner: grega.owner,
			card: 'Weebo',
			data: weebo.data,
		};

		expect(convertedActionForActivePlayer.type).toEqual(ACTION_EFFECT, 'Action type is correct');
		expect(convertedActionForActivePlayer.effectType).toEqual(EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES, 'Effect type is correct');
		expect(convertedActionForActivePlayer.sourceCard).toEqual(convertedSourceCard, 'Source card is converted correctly');
		expect(convertedActionForActivePlayer.sourceZone).toEqual(ZONE_TYPE_DECK, 'Source zonee is passed');
		expect(convertedActionForActivePlayer.destinationCard).toEqual(convertedDestinationCard, 'Destination card is converted correctly');
		expect(convertedActionForActivePlayer.destinationZone).toEqual(ZONE_TYPE_HAND, 'Destination zonee is passed');

		const convertedActionForNonActivePlayer = convert(serverAction, gameState, NON_ACTIVE_PLAYER);

		const maskedSourceCard = {
			id: weeboInDeck.id,
			owner: grega.owner,
			card: null,
			data: null,
		};

		const maskedDestinationCard = {
			id: weebo.id,
			owner: grega.owner,
			card: null,
			data: null,
		};

		expect(convertedActionForNonActivePlayer.type).toEqual(ACTION_EFFECT, 'Action type is correct');
		expect(convertedActionForNonActivePlayer.effectType).toEqual(EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES, 'Effect type is correct');
		expect(convertedActionForNonActivePlayer.sourceCard).toEqual(maskedSourceCard, 'Source card is converted and masked correctly');
		expect(convertedActionForNonActivePlayer.sourceZone).toEqual(ZONE_TYPE_DECK, 'Source zonee is passed');
		expect(convertedActionForNonActivePlayer.destinationCard).toEqual(maskedDestinationCard, 'Destination card is converted and masked correctly');
		expect(convertedActionForNonActivePlayer.destinationZone).toEqual(ZONE_TYPE_HAND, 'Destination zonee is passed');
	});

	it('EFFECT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [yaki]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
			spellMetaData: {
				[weebo.id]: {
					energyValues: {
						TEST_ID: 1,
						ANOTHER_TEST_ID: 4,
					},
				},
			},		
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES,
			source: weebo,
			energyOnCreatures: '$energyValues',
			generatedBy: weebo.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedSource = {
			id: weebo.id,
			owner: weebo.owner,
			card: 'Weebo',
			data: {
				...weebo.data,
			},
		};
		expect(convertedAction.type).toEqual(ACTION_EFFECT, 'Type is passed as is');
		expect(convertedAction.effectType).toEqual(EFFECT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES, 'Effect type is passed as is');
		expect(convertedAction.source).toEqual(convertedSource, 'Source card is converted correctly');
		expect(convertedAction.energyOnCreatures.TEST_ID).toEqual(1, 'Data is retrieved from spellMetaData');
		expect(convertedAction.energyOnCreatures.ANOTHER_TEST_ID).toEqual(4, 'Data is retrieved from spellMetaData');
	});

	it('EFFECT_TYPE_PAYING_ENERGY_FOR_POWER (creature)', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		const serverAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_PAYING_ENERGY_FOR_POWER,
			target: weebo,
			source: weebo,
			amount: 1,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedTarget = {
			id: weebo.id,
			owner: weebo.owner,
			card: 'Weebo',
			data: weebo.data,
		};

		expect(convertedAction.type).toEqual(ACTION_EFFECT, 'Action type is correct');
		expect(convertedAction.effectType).toEqual(EFFECT_TYPE_PAYING_ENERGY_FOR_POWER, 'Effect type is correct');
		expect(convertedAction.target).toEqual(convertedTarget, 'Target is converted correctly');
		expect(convertedAction.amount).toEqual(1, 'Amount is passed correctly');
	});

	it('EFFECT_TYPE_PAYING_ENERGY_FOR_POWER (magi)', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		const serverAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_PAYING_ENERGY_FOR_POWER,
			target: grega,
			amount: 3,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedTarget = {
			id: grega.id,
			owner: grega.owner,
			card: 'Grega',
			data: grega.data,
		};

		expect(convertedAction.type).toEqual(ACTION_EFFECT, 'Action type is correct');
		expect(convertedAction.effectType).toEqual(EFFECT_TYPE_PAYING_ENERGY_FOR_POWER, 'Effect type is correct');
		expect(convertedAction.target).toEqual(convertedTarget, 'Target is converted correctly');
		expect(convertedAction.amount).toEqual(3, 'Amount is passed correctly');
	});

	it('EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		const serverAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,
			from: grega,
			amount: 5,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedFrom = {
			id: grega.id,
			owner: grega.owner,
			card: 'Grega',
			data: grega.data,
		};

		expect(convertedAction.type).toEqual(ACTION_EFFECT, 'Action type is correct');
		expect(convertedAction.effectType).toEqual(EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE, 'Effect type is correct');
		expect(convertedAction.from).toEqual(convertedFrom, 'Payment source is converted correctly');
		expect(convertedAction.amount).toEqual(5, 'Amount is passed correctly');
	});

	it('EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		const serverAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL,
			from: grega,
			amount: 6,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		const convertedFrom = {
			id: grega.id,
			owner: grega.owner,
			card: 'Grega',
			data: grega.data,
		};

		expect(convertedAction.type).toEqual(ACTION_EFFECT, 'Action type is correct');
		expect(convertedAction.effectType).toEqual(EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL, 'Effect type is correct');
		expect(convertedAction.from).toEqual(convertedFrom, 'Payment source is converted correctly');
		expect(convertedAction.amount).toEqual(6, 'Amount is passed correctly');
	});

	it('EFFECT_TYPE_DISCARD_RESHUFFLED', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const ayebaw = new CardInGame(byName('Ayebaw'), ACTIVE_PLAYER);
		const pharan = new CardInGame(byName('Pharan'), ACTIVE_PLAYER);
		const xyxElder = new CardInGame(byName('Xyx Elder'), ACTIVE_PLAYER);

		const gameState = new State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [grega]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		const serverAction = {
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_DISCARD_RESHUFFLED,
			player: ACTIVE_PLAYER,
			cards: [ayebaw.id, pharan.id, xyxElder.id],
			generatedBy: grega.id,
		};

		const convertedAction = convert(serverAction, gameState, ACTIVE_PLAYER);

		expect(convertedAction.type).toEqual(ACTION_EFFECT, 'Action type is correct');
		expect(convertedAction.effectType).toEqual(EFFECT_TYPE_DISCARD_RESHUFFLED, 'Effect type is correct');
		expect(convertedAction.player).toEqual(ACTIVE_PLAYER, 'Active player is passed correctly');
		expect(convertedAction.cards).toEqual([ayebaw.id, pharan.id, xyxElder.id], 'List of card IDs is passed correctly');
		expect(convertedAction.generatedBy).toEqual(grega.id, 'GeneratedBy is passed correctly');
	});
});
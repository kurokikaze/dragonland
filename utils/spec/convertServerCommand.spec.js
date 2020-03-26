/* global expect, describe, it */

const moonlands = require('moonlands');
const CardInGame = require('moonlands/src/classes/CardInGame');
const Zone = require('moonlands/src/classes/Zone');

const {
	ACTION_PASS,
	ACTION_ENTER_PROMPT,
	ACTION_POWER,
	ACTION_EFFECT,

	EFFECT_TYPE_ADD_ENERGY_TO_MAGI,

	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_NUMBER,

	ZONE_TYPE_HAND,
	ZONE_TYPE_DECK,
	ZONE_TYPE_DISCARD,
	ZONE_TYPE_ACTIVE_MAGI,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_DEFEATED_MAGI,
	ZONE_TYPE_IN_PLAY,
} = require('moonlands/src/const');

/* eslint-disable no-unused-vars */
const STEP_ENERGIZE = 0;
const STEP_PRS_FIRST = 1;
const STEP_ATTACK = 2;
const STEP_CREATURES = 3;
const STEP_PRS_SECOND = 4;
const STEP_DRAW = 5;
/* eslint-enable no-unused-vars */

const {byName} = require('moonlands/src/cards');
const convert = require('../convertServerCommand');

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

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [yaki]),
			step: STEP_PRS_SECOND,
			activePlayer: ACTIVE_PLAYER,
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_PASS,
			player: ACTIVE_PLAYER,
		};

		const convertedAction = convert(serverAction, gameState);

		expect(convertedAction.type).toEqual(ACTION_PASS, 'Type is passed as is');
		expect(convertedAction.player).toEqual(ACTIVE_PLAYER, 'Type is passed as is');
		expect(convertedAction.newStep).toEqual(STEP_DRAW, 'Next step is STEP_DRAW');
	});

	it('Adds next step (from DRAW to ENERGIZE)', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [weebo], [yaki]),
			step: STEP_DRAW,
			activePlayer: ACTIVE_PLAYER,
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		const serverAction = {
			type: ACTION_PASS,
			player: ACTIVE_PLAYER,
		};

		const convertedAction = convert(serverAction, gameState);

		expect(convertedAction.type).toEqual(ACTION_PASS, 'Type is passed as is');
		expect(convertedAction.player).toEqual(ACTIVE_PLAYER, 'Type is passed as is');
		expect(convertedAction.newStep).toEqual(STEP_ENERGIZE, 'Next step is STEP_ENERGIZE');
	});
});

describe('ACTION_ENTER_PROMPT', () => {
	it('Message templating', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
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

		const convertedAction = convert(serverAction, gameState);

		expect(convertedAction.message).toEqual('Roll result is 12', 'Message is templated correctly');
	});

	it('PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
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

		const convertedAction = convert(serverAction, gameState);

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

		const gameState = new moonlands.State({
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

		const convertedAction = convert(serverAction, gameState);

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
});

describe('ACTION_POWER', () => {
	it('Creature power', () => {
		const ACTIVE_PLAYER = 42;
		const NON_ACTIVE_PLAYER = 44;

		const TEST_MAX_VALUE = 12;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
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

		const convertedAction = convert(serverAction, gameState);

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

		const gameState = new moonlands.State({
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

		const convertedAction = convert(serverAction, gameState);

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

		const TEST_MAX_VALUE = 12;

		const grega = new CardInGame(byName('Grega'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
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
			type: ACTION_EFFECT,
			effectType: EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
			target: grega,
			amount: 4,
		};

		const convertedAction = convert(serverAction, gameState);

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
});
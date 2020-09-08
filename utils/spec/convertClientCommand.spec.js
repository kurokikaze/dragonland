/* global expect, describe, it */

import * as moonlands from 'moonlands';
import CardInGame from 'moonlands/src/classes/CardInGame.js';
import Zone from 'moonlands/src/classes/Zone.js';

import {byName} from 'moonlands/src/cards.js';
import convert from '../convertClientCommand.js';

import {
	ACTION_PLAY,
	ACTION_ATTACK,
	ACTION_POWER,
	ACTION_RESOLVE_PROMPT,

	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_SINGLE_MAGI,
	// PROMPT_TYPE_SINGLE_RELIC,

	ZONE_TYPE_HAND,
	ZONE_TYPE_DECK,
	ZONE_TYPE_DISCARD,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_IN_PLAY,
	ZONE_TYPE_ACTIVE_MAGI,
} from 'moonlands/src/const.js';

// @todo move to moonlands
const PROMPT_TYPE_SINGLE_RELIC = 'prompt/single_relic';

/* eslint-disable no-unused-vars */
const STEP_ENERGIZE = 0;
const STEP_PRS_FIRST = 1;
const STEP_ATTACK = 2;
const STEP_CREATURES = 3;
const STEP_PRS_SECOND = 4;
const STEP_DRAW = 5;
/* eslint-enable no-unused-vars */

const createZones = (player1, player2, creatures = [], activeMagi = []) => [
	new Zone('Player 1 hand', ZONE_TYPE_HAND, player1),
	new Zone('Player 2 hand', ZONE_TYPE_HAND, player2),
	new Zone('Player 1 deck', ZONE_TYPE_DECK, player1),
	new Zone('Player 2 deck', ZONE_TYPE_DECK, player2),
	new Zone('Player 1 discard', ZONE_TYPE_DISCARD, player1),
	new Zone('Player 2 discard', ZONE_TYPE_DISCARD, player2),
	new Zone('Player 1 active magi', ZONE_TYPE_ACTIVE_MAGI, player1).add(activeMagi),
	new Zone('Player 2 active magi', ZONE_TYPE_ACTIVE_MAGI, player2),
	new Zone('Player 1 active magi', ZONE_TYPE_MAGI_PILE, player1),
	new Zone('Player 2 active magi', ZONE_TYPE_MAGI_PILE, player2),
	new Zone('In play', ZONE_TYPE_IN_PLAY, null).add(creatures),
];

describe('ACTION_RESOLVE_PROMPT', () => {
	it('PROMPT_TYPE_SINGLE_CREATURE', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_PRS_SECOND,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_CREATURE,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_ACTIVE_MAGI, ACTIVE_PLAYER).add([yaki]);
		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([weebo]);

		const clientAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: weebo.id,
		};

		const expectedAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: weebo,
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});

	it.skip('PROMPT_TYPE_SINGLE_RELIC', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);
		const robesOfTheAges = new CardInGame(byName('Robes of the Ages'), ACTIVE_PLAYER);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_PRS_SECOND,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_RELIC,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_ACTIVE_MAGI, ACTIVE_PLAYER).add([yaki]);
		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([weebo, robesOfTheAges]);

		const clientAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: robesOfTheAges.id,
		};

		const expectedAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: robesOfTheAges,
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});

	it('PROMPT_TYPE_SINGLE_CREATURE_FILTERED', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_PRS_SECOND,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_ACTIVE_MAGI, ACTIVE_PLAYER).add([yaki]);
		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([weebo]);

		const clientAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: weebo.id,
		};

		const expectedAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: weebo,
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});

	it('PROMPT_TYPE_SINGLE_RELIC', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_PRS_SECOND,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_ACTIVE_MAGI, ACTIVE_PLAYER).add([yaki]);
		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([weebo]);

		const clientAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: weebo.id,
		};

		const expectedAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: weebo,
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});

	it('PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI / creature', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_PRS_SECOND,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_ACTIVE_MAGI, ACTIVE_PLAYER).add([yaki]);
		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([weebo]);

		const clientAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: weebo.id,
		};

		const expectedAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: weebo,
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});

	it('PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI / magi', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_PRS_SECOND,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_ACTIVE_MAGI, ACTIVE_PLAYER).add([yaki]);
		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([weebo]);

		const clientAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: yaki.id,
		};

		const expectedAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: yaki,
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});	

	it('PROMPT_TYPE_SINGLE_MAGI', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const yaki = new CardInGame(byName('Yaki'), ACTIVE_PLAYER).addEnergy(6);
		const weebo = new CardInGame(byName('Weebo'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_PRS_SECOND,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_MAGI,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_ACTIVE_MAGI, ACTIVE_PLAYER).add([yaki]);
		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([weebo]);

		const clientAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: yaki.id,
		};

		const expectedAction = {
			type: ACTION_RESOLVE_PROMPT,
			target: yaki,
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});	
});

describe('ACTION_ATTACK', () => {
	it('Creature', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const arbolit = new CardInGame(byName('Arbolit'), ACTIVE_PLAYER).addEnergy(2);
		const weebo = new CardInGame(byName('Weebo'), NON_ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_ATTACK,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([weebo, arbolit]);

		const clientAction = {
			type: ACTION_ATTACK,
			source: arbolit.id,
			target: weebo.id,
		};

		const expectedAction = {
			type: ACTION_ATTACK,
			source: arbolit,
			target: weebo,
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});

	it('Magi', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const arbolit = new CardInGame(byName('Arbolit'), ACTIVE_PLAYER).addEnergy(2);
		const yaki = new CardInGame(byName('Yaki'), NON_ACTIVE_PLAYER).addEnergy(6);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_ATTACK,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_ACTIVE_MAGI, NON_ACTIVE_PLAYER).add([yaki]);
		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([arbolit]);

		const clientAction = {
			type: ACTION_ATTACK,
			source: arbolit.id,
			target: yaki.id,
		};

		const expectedAction = {
			type: ACTION_ATTACK,
			source: arbolit,
			target: yaki,
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});
});

describe('ACTION_POWER', () => {
	it('Creature', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const arbolit = new CardInGame(byName('Arbolit'), ACTIVE_PLAYER).addEnergy(2);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_PRS_FIRST,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
			promptParams: {},			
		});
		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_IN_PLAY, null).add([arbolit]);

		const clientAction = {
			type: ACTION_POWER,
			source: arbolit.id,
			power: arbolit.card.data.powers[0].name,
		};

		const expectedAction = {
			player: ACTIVE_PLAYER,
			type: ACTION_POWER,
			source: arbolit,
			power: arbolit.card.data.powers[0],
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});
});

describe('ACTION_PLAY', () => {
	it('Card', () => {
		const ACTIVE_PLAYER = 0;
		const NON_ACTIVE_PLAYER = 1;

		const arbolit = new CardInGame(byName('Arbolit'), ACTIVE_PLAYER);

		const gameState = new moonlands.State({
			zones: createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER),
			step: STEP_CREATURES,
			activePlayer: ACTIVE_PLAYER,
			prompt: true,
			promptType: PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
			promptParams: {},			
		});

		gameState.setPlayers(ACTIVE_PLAYER, NON_ACTIVE_PLAYER);

		gameState.getZone(ZONE_TYPE_HAND, ACTIVE_PLAYER).add([arbolit]);

		const clientAction = {
			type: ACTION_PLAY,
			payload: {
				player: ACTIVE_PLAYER,
				card: arbolit.id,
			},
		};

		const expectedAction = {
			type: ACTION_PLAY,
			payload: {
				player: ACTIVE_PLAYER,
				card: arbolit,
			},
		};

		const result = convert(clientAction, gameState);

		expect(result).toEqual(expectedAction);
	});
});

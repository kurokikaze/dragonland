const express = require('express');
const nanoid = require('nanoid');
const moonlands = require('moonlands');
const {constructDeck} = require('../utils');
const convertClientCommand = require('../utils/convertClientCommand');

const {
	ACTION_PASS,
	ACTION_EFFECT,
	ACTION_ENTER_PROMPT,

	PROMPT_TYPE_CHOOSE_CARDS,

	EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
	EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
	EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,
	EFFECT_TYPE_ADD_ENERGY_TO_CREATURE,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI,
	EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL,
	EFFECT_TYPE_MOVE_ENERGY,

	ZONE_TYPE_DISCARD,
	ZONE_TYPE_DECK,
	ZONE_TYPE_IN_PLAY,
} = require('moonlands/src/const');

const ACTION_DISPLAY = 'display';
const ZONE_UPDATE = 'subtypes/zone_update';

const NUMBER_OF_STEPS = 6;

var router = express.Router();

var runningGames = {};

function createGame(playerOne, playerTwo, deckOne, deckTwo) {
	const gameId = nanoid();

	const zones = [];

	const gameState = new moonlands.State({
		zones,
		step: null,
		activePlayer: playerOne,
	});

	gameState.setPlayers(playerOne, playerTwo);

	gameState.setDeck(
		playerOne,
		deckOne,
	);

	gameState.setDeck(
		playerTwo,
		deckTwo,
	);

	runningGames[gameId] = gameState;

	return gameId;
}

router.post('/start', function(req, res) {
	const playerOne = parseInt(req.body.playerOne || '1', 10);
	const playerTwo = parseInt(req.body.playerTwo || '2', 10);

	const deckOne = constructDeck(
		req.body.deckOne.split('\r\n'),
	);

	const deckTwo = constructDeck(
		req.body.deckTwo.split('\r\n'),
	);

	const gameId = createGame(
		playerOne,
		playerTwo,
		deckOne,
		deckTwo,
	);

	runningGames[gameId].setup();

	res.render('started', {
		gameId,
		playerOne,
		playerTwo,
	});
});

var ioLaunched = false;

router.get(/^\/game\/([a-zA-Z0-9_-]+)\/(\d)$/, function(req, res) {
	const gameId = req.params[0];
	const playerId = req.params[1];

	if (!ioLaunched) {
		const io = req.app.get('io');

		console.log('Running games:');
		console.dir(Object.keys(runningGames));

		io.on('connection', function(socket){
			const gameId = socket.handshake.query.gameId;
			const playerId = socket.handshake.query.playerId;
			console.log(`Sent game id ${gameId}, player id ${playerId}`);
			console.log('Running games:');
			console.dir(Object.keys(runningGames));
			runningGames[gameId].enableDebug();
			// Converting game actions for sending
			runningGames[gameId].actionStreamOne.on('action', action => 
			{
				switch(action.type) {
					case ACTION_PASS: {
						const step = runningGames[gameId].state.step;

						const newStep = (step === null) ? 0 : (step + 1) % NUMBER_OF_STEPS;

						action = {
							...action,
							newStep,
						};
						break;
					}
					case ACTION_ENTER_PROMPT: {
						switch(action.promptType) {
							case PROMPT_TYPE_CHOOSE_CARDS: {
								const discardCards = runningGames[gameId].getZone(ZONE_TYPE_DISCARD, action.player).cards.map(card => card.card.name);
								const libraryCards = runningGames[gameId].getZone(ZONE_TYPE_DECK, action.player).cards.map(card => card.card.name);
								const searchableCards = [...discardCards, ...libraryCards];
								const availableCards = action.promptParams.filter(card => searchableCards.includes(card));

								action.availableCards = availableCards;                                
								break;
							}
						}
						break;
					}
					case ACTION_EFFECT: {
						switch(action.effectType) {
							case EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES: {
								const player = action.destinationCard.owner;
								const sourceZoneContent = runningGames[gameId].getZone(
									action.sourceZone, 
									(action.sourceZone == ZONE_TYPE_IN_PLAY) ? null : player,
								).serialize();

								const destinationZoneContent = runningGames[gameId].getZone(
									action.destinationZone,
									(action.destinationZone == ZONE_TYPE_IN_PLAY) ? null : player,
								).serialize();

								socket.emit(ACTION_DISPLAY, {
									subtype: ZONE_UPDATE,
									zoneType: action.sourceZone,
									player,
									content: sourceZoneContent,
								});

								socket.emit(ACTION_DISPLAY, {
									subtype: ZONE_UPDATE,
									zoneType: action.destinationZone,
									player,
									content: destinationZoneContent,
								});
								break;
							}
							case EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE: {
								const fromCard = (typeof action.from == 'string') ?
									runningGames[gameId].getMetaValue(action.from, action.generatedBy) :
									action.from;
								const from = (fromCard.length) ? fromCard[0] : fromCard;
								from.card = from.card.card;

								action = {
									...action,
									from,
								};
								break;
							}
							case EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL: {
								const fromCard = (typeof action.from == 'string') ?
									runningGames[gameId].getMetaValue(action.from, action.generatedBy) :
									action.from;
								const from = (fromCard.length) ? fromCard[0] : fromCard;
								from.card = from.card.card;

								action = {
									...action,
									from,
								};
								break;
							}
							case EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI: {
								const targetCard = (typeof action.target == 'string') ?
									runningGames[gameId].getMetaValue(action.target, action.generatedBy) :
									action.target;

								const amount = (typeof action.amount == 'string') ?
									runningGames[gameId].getMetaValue(action.amount, action.generatedBy) :
									action.amount;
                                
								const target = (targetCard.length) ? targetCard[0] : targetCard;
								target.card = target.card.card;

								action = {
									...action,
									target,
									amount,
								};
								break;
							}
							case EFFECT_TYPE_MOVE_ENERGY: {
								const targetCard = (typeof action.target == 'string') ?
									runningGames[gameId].getMetaValue(action.target, action.generatedBy) :
									action.target;

								const target = (targetCard.length) ? targetCard[0] : targetCard;
								target.card = target.card.card;

								const sourceCard = (typeof action.source == 'string') ?
									runningGames[gameId].getMetaValue(action.source, action.generatedBy) :
									action.source;

								const source = (sourceCard.length) ? sourceCard[0] : sourceCard;
								source.card = source.card.card;

								const amount = (typeof action.amount == 'string') ?
									runningGames[gameId].getMetaValue(action.amount, action.generatedBy) :
									action.amount;

								action = {
									...action,
									target,
									source,
									amount,
								};
								break;
							}
							case EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE: {
								const targetCard = (typeof action.target == 'string') ?
									runningGames[gameId].getMetaValue(action.target, action.generatedBy) :
									action.target;

								const amount = (typeof action.amount == 'string') ?
									runningGames[gameId].getMetaValue(action.amount, action.generatedBy) :
									action.amount;
                                
								const target = (targetCard.length) ? targetCard[0] : targetCard;
								target.card = target.card.card;

								action = {
									...action,
									target,
									amount,
								};
								break;
							}
							case EFFECT_TYPE_ADD_ENERGY_TO_CREATURE: {
								const targetCard = (typeof action.target == 'string') ?
									runningGames[gameId].getMetaValue(action.target, action.generatedBy) :
									action.target;
                                
								const target = (targetCard.length) ? targetCard[0] : targetCard;
								target.card = target.card.card;

								const amount = (typeof action.amount == 'string') ?
									runningGames[gameId].getMetaValue(action.amount, action.generatedBy) :
									action.amount;

								action = {
									...action,
									target,
									amount,
								};
								break;
							}
							case EFFECT_TYPE_ADD_ENERGY_TO_MAGI: {
								const targetCard = (typeof action.target == 'string') ?
									runningGames[gameId].getMetaValue(action.target, action.generatedBy) :
									action.target;
                                
								const target = (targetCard.length) ? targetCard[0] : targetCard;
								target.card = target.card.card;

								action = {
									...action,
									target,
								};
								break;
							}
						}
						break;
					}
				}
				socket.emit('action', action);
			});

			// Converting client actions for game engine			
			socket.on('action', action => {
				const expandedAction = convertClientCommand(action, runningGames[gameId]);

				runningGames[gameId].update(expandedAction);
			});

			socket.on('disconnect', function(){
				console.log('user disconnected');
			});
		});

		ioLaunched = true;
	}

	res.render('game', {
		gameId,
		playerId,
		status: runningGames[gameId].serializeData(),
	});
});

module.exports = router;

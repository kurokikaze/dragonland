const express = require('express');
const nanoid = require('nanoid');
const moonlands = require('moonlands');
const {constructDeck} = require('../utils');

const convertClientCommand = require('../utils/convertClientCommand');
const convertServerCommand = require('../utils/convertServerCommand');

const {
	ACTION_EFFECT,

	EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,

	ZONE_TYPE_IN_PLAY,
} = require('moonlands/src/const');

const ACTION_DISPLAY = 'display';
const ZONE_UPDATE = 'subtypes/zone_update';

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
				if (action.type === ACTION_EFFECT && action.effectType === EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES) {
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
					socket.emit('action', action);
				} else {
					const convertedAction = convertServerCommand(action, runningGames[gameId]);
					socket.emit('action', convertedAction);
				}
			});

			// Converting client actions for game engine			
			socket.on('action', action => {
				const expandedAction = convertClientCommand(action, runningGames[gameId]);
				try {
					runningGames[gameId].update(expandedAction);
				} catch(e) {
					console.log('Engine error!');
					console.log('On action:');
					console.dir(expandedAction);
					console.log();
					console.dir(runningGames[gameId].state);
				}
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
		initialState: runningGames[gameId].serializeData(playerId),
	});
});

module.exports = router;

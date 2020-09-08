import express from 'express';
import nanoid from 'nanoid';
import {State} from 'moonlands';
import {constructDeck} from '../utils/index.js';

import convertClientCommand from '../utils/convertClientCommand.js';
import convertServerCommand from '../utils/convertServerCommand.js';

var router = express.Router();

var runningGames = {};

function createGame(playerOne, playerTwo, deckOne, deckTwo) {
	const gameId = nanoid();

	const zones = [];

	const gameState = new State({
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
			runningGames[gameId].actionStreamOne.on('action', action => {
				const convertedAction = convertServerCommand(action, runningGames[gameId]);
				socket.emit('action', convertedAction);
			});

			// Converting client actions for game engine			
			socket.on('clientAction', action => {
				const expandedAction = convertClientCommand(action, runningGames[gameId]);
				
				try {
					console.log('Expanded Action:');
					console.dir(expandedAction);
					runningGames[gameId].update(expandedAction);
				} catch(e) {
					console.log('Engine error!');
					console.log('On action:');
					console.dir(expandedAction);
					console.log();
					console.dir(runningGames[gameId].state);
					console.log();
					console.log(e.name);
					console.log(e.message);
					console.log(e.stack);
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

export default router;

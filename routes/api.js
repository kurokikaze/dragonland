import express from 'express';
import nanoid from 'nanoid';
import {State} from 'moonlands';
// import passport from 'passport';
import mongoDb from 'mongodb';
import ensure from 'connect-ensure-login';

import config from '../config.js';

const { MongoClient, ObjectID } = mongoDb;

import convertClientCommand from '../utils/convertClientCommand.js';
import convertServerCommand from '../utils/convertServerCommand.js';

var router = express.Router();

const runningGames = {};
const gamePlayers = {};
const keyHash = {};

function createGame(playerOne, playerTwo, deckOne, deckTwo) {
	const gameId = nanoid();
	const playerOneHash = nanoid();
	const playerTwoHash = nanoid();

	keyHash[playerOneHash] = gameId;
	keyHash[playerTwoHash] = gameId;

	gamePlayers[playerOneHash] = 1;
	gamePlayers[playerTwoHash] = 2;
	
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

	return [gameId, playerOneHash, playerTwoHash];
}

router.post('/start',
	ensure.ensureLoggedIn('/users/login'),
	async function(req, res) {
		const playerOne = parseInt(req.body.playerOne || '1', 10);
		const playerTwo = parseInt(req.body.playerTwo || '2', 10);

		const chosenDeckOne = req.body.chosenDeckOne;
		const chosenDeckTwo = req.body.chosenDeckTwo;
		console.dir(req.body);

		try {
			const client = new MongoClient(config.databaseUri);
			await client.connect();
			const database = client.db(config.databaseName);
			const collection = database.collection('decks');

			const deckOneObject = await collection.findOne({_id: new ObjectID(chosenDeckOne)});
			const deckTwoObject = await collection.findOne({_id: new ObjectID(chosenDeckTwo)});

			const deckOne = deckOneObject.cards;
			const deckTwo = deckTwoObject.cards;

			if (deckOne && deckOne.length > 0 && deckTwo && deckTwo.length > 0) {
				const [
					gameId,
					playerOneHash,
					playerTwoHash
				] = createGame(
					playerOne,
					playerTwo,
					deckOne,
					deckTwo,
				);
			
				runningGames[gameId].setup();
				runningGames[gameId].enableDebug();
			
				res.render('started', {
					gameId,
					playerOneHash,
					playerTwoHash,
				});
			} else {
				res.render('game-error', { 
					message: 'Deck retrieval error',
					subtext: 'Wrong deck format',
				});
			}
		} catch(e) {
			res.render('game-error', { 
				message: 'Database error',
				subtext: 'Failed to connect to MongoDB',
			});
		}
	}
);

var ioLaunched = false;

router.get(/^\/game\/([a-zA-Z0-9_-]+)\/?$/,
	function(req, res) {
		const playerHash = req.params[0];

		const gameId = keyHash[playerHash];
		const playerId = gamePlayers[playerHash];

		if (gameId && playerId) {
			if (!ioLaunched) {
				const io = req.app.get('io');

				console.log('Running games:');
				console.dir(Object.keys(runningGames));

				io.on('connection', function(socket) {
					const playerHash = socket.handshake.query.playerHash;

					const gameId = keyHash[playerHash];
					const playerId = gamePlayers[playerHash];

					console.log(`Sent game id ${gameId}, player id ${playerId}`);
					console.log('Running games:');
					console.dir(Object.keys(runningGames));

					if (gameId && playerId) {
					// const playerId = parseInt(socket.handshake.query.playerId, 10);
						
						// runningGames[gameId].enableDebug();
						// Converting game actions for sending
						runningGames[gameId].actionStreamOne.on('action', action => {
							const convertedAction = convertServerCommand(action, runningGames[gameId], playerId);
							socket.emit('action', convertedAction);
						});

						// Converting client actions for game engine
						socket.on('clientAction', action => {
							// Only process active player actions or specifically requested prompt resolutions
							if (runningGames[gameId].state.activePlayer === playerId ||
								(runningGames[gameId].state.prompt && runningGames[gameId].state.promptPlayer === playerId)) {
								const expandedAction = convertClientCommand({ ...action, player: playerId}, runningGames[gameId]);

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
							}
						});

						socket.on('disconnect', function(){
							console.log('user disconnected');
						});
					}
				});

				ioLaunched = true;
			}

			res.render('game', {
				gameId,
				playerId,
				playerHash,
				initialState: runningGames[gameId].serializeData(playerId),
			});
		} else {
			res.render('game-error', {
				message: 'No such game or player',
				subtext: 'Check the link please',
			});
		}
	}
);

export default router;

import express from 'express';
import nanoid from 'nanoid';
import { open, write, close } from 'fs';
import { join as joinPath } from 'path';
import { State } from 'moonlands';
import ensure from 'connect-ensure-login';

import { getDeckById, saveDeckById, saveNewDeck } from '../utils/database.js';
import { getChallenges, addChallenge, removeByName } from '../utils/challenge.js';
import config from '../config.js';
import { ACTION_PLAYER_WINS } from 'moonlands/dist/const.js';
import convertClientCommand from '../utils/convertClientCommand.js';
import convertServerCommand from '../utils/convertServerCommand.js';

var router = express.Router();

var gamesCounter = 0;

const runningGames = {};
// Player ID (Mongo) to player Id (game)
const gamePlayers = {};
// Player hash to game hash 
const keyHash = {};
// Player id (Mongo) to player hash
const participants = {};

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

	// gameState.enableTurnTimer(100);
	runningGames[gameId] = gameState;
	gamesCounter++;

	return [gameId, playerOneHash, playerTwoHash];
}

router.post('/start',
	ensure.ensureLoggedIn('/users/login'),
	async function(req, res) {
		const playerOne = parseInt(req.body.playerOne || '1', 10);
		const playerTwo = parseInt(req.body.playerTwo || '2', 10);

		const chosenDeckOne = req.body.chosenDeckOne;
		const chosenDeckTwo = req.body.chosenDeckTwo;

		try {
			const deckOneObject = await getDeckById(chosenDeckOne);
			const deckTwoObject = await getDeckById(chosenDeckTwo);

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

router.get(/^\/deck\/([a-zA-Z0-9_-]+)\/?$/,
	ensure.ensureLoggedIn('/users/login'),
	async (req, res) => {
		const deckId = req.params[0];
		const deck = await getDeckById(deckId);

		if (deck && deck.cards) {
			res.json(deck);
		} else {
			res.sendStatus(404);
		}
	});

router.post(/^\/deck\/([a-zA-Z0-9_-]+)\/?$/,
	ensure.ensureLoggedIn('/users/login'),
	async (req, res) => {
		const newDeck = req.body;
		const deckId = req.params[0];
		const gameId = req.user.gameId;

		if (deckId === 'new') {
			const insertedId = await saveNewDeck({
				...newDeck,
				playerId: gameId,
			});
			
			res.json({...newDeck, _id: insertedId});
		} else {
			const deck = await getDeckById(deckId);

			if (deck && deck.cards && deck.playerId === gameId) {
				if (newDeck._id) {
					await saveDeckById({
						...newDeck,
						playerId: gameId,
					});
				}
				res.json({
					...newDeck,
					playerId: gameId,
				});
			} else {
				res.sendStatus(404);
			}
		}
	});

router.get('/stats',
	function(req, res) {
		res.render('stats', {
			runningGames,
			gamesCounter,
		});
	}
);

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
						// Converting game actions for sending
						runningGames[gameId].actionStreamOne.on('action', action => {
							var convertedAction = null;
							try {
								convertedAction = convertServerCommand(action, runningGames[gameId], playerId);
							} catch (error) {
								console.dir(error);
								console.log('Error converting server command:');
								console.dir(action);
								console.log('Because of:');
								console.dir(action.sourceCard);
							}
							socket.emit('action', convertedAction);

							// if convertedAction signals game end, shut the session down
							// and free the players
							if (convertedAction.type === ACTION_PLAYER_WINS) {
								setTimeout(() => {
									socket.removeAllListeners();
									socket.disconnect();

									if (runningGames[gameId] && runningGames[gameId].userHashes) {
										runningGames[gameId].userHashes.forEach(userHash => {delete participants[userHash];});
									}
									delete runningGames[gameId];
									delete keyHash[playerHash];
									delete gamePlayers[playerHash];
								}, 1000);
							}
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
									console.log('');
									console.dir(runningGames[gameId].state);
									console.log('');
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

router.get('/challenges', 
	ensure.ensureLoggedIn('/users/login'),
	(req, res) => {
		if (participants[req.user.gameId]) {
			res.json({hash: participants[req.user.gameId]});
		} else {
			res.json(getChallenges());
		}
	}
);

router.post('/challenges',
	ensure.ensureLoggedIn('/users/login'),
	async (req, res) => {
		const challenges = getChallenges();
		if (!challenges.some(challenge => challenge.user === req.user.name)) {
			const deck = await getDeckById(req.body.deckId);
			if (deck) {
				addChallenge({
					user: req.user.name,
					userId: req.user.gameId,
					deck: deck.name,
					deckId: req.body.deckId,
				});
			}
		}

		res.json(getChallenges());
	}
);

router.post('/cancel',
	ensure.ensureLoggedIn('/users/login'),
	(req, res) => {
		removeByName(req.user.name);
		res.json(getChallenges());
	},
);

/*
 * Fields to accept a challenge:
 * name - matching name in challenge
 * deckId - what deck to use
 */
router.post('/accept',
	ensure.ensureLoggedIn('/users/login'),
	async (req, res) => {
		const challenge = getChallenges().find(challenge => challenge.user === req.body.name);
		if (challenge) {
			const deckOne = await getDeckById(challenge.deckId);
			const deckTwo = await getDeckById(req.body.deckId);

			const [
				gameId,
				playerOneHash,
				playerTwoHash
			] = createGame(
				1,
				2,
				deckOne.cards,
				deckTwo.cards,
			);

			open(joinPath(config.logDirectory, `${gameId}.log`), 'w', (err, file) => {
				if (!err) {
					runningGames[gameId].logStream.on('action', action => {
						write(file, JSON.stringify(action, null, 2) + ',\n', () => null);
					});
					runningGames[gameId].logStream.on('close', () => {
						close(file, () => null);
					});
				} else {
					console.log('===================');
					console.dir(err);
					console.log('===================');
				}
			});

			runningGames[gameId].setup();
			runningGames[gameId].enableDebug();

			participants[challenge.userId] = playerOneHash;
			participants[req.user.gameId] = playerTwoHash;

			runningGames[gameId].userHashes = [challenge.userId, req.user.gameId];

			removeByName(challenge.user);
			removeByName(req.user.name);

			res.json({
				hash: playerTwoHash,
			});
		} else {
			res.json(getChallenges());
		}
		
	}
);

export default router;

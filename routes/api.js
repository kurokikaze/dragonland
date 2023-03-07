import express from 'express';
import { open, write, close, readdir, readFile } from 'fs';
import { join as joinPath } from 'path';
import { State } from 'moonlands';
import { byName } from 'moonlands/dist/cards';
import CardInGame from 'moonlands/dist/classes/CardInGame';
import Zone from 'moonlands/dist/classes/Zone';
import ensure from 'connect-ensure-login';

import { getDeckById, saveDeckById, saveNewDeck } from '../utils/database.js';
import { getChallenges, addChallenge, removeByName } from '../utils/challenge.js';
import config from '../config.js';
import {
	ACTION_RESOLVE_PROMPT,
	ZONE_TYPE_ACTIVE_MAGI,
	ZONE_TYPE_HAND,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_IN_PLAY,
	ZONE_TYPE_DECK,
	ZONE_TYPE_DEFEATED_MAGI,
	ZONE_TYPE_DISCARD,
	ACTION_PLAY,
} from 'moonlands/dist/const.js';
import convertServerCommand from '../utils/convertServerCommand.js';
import { RegistryService } from '../utils/RegistryService.js';
import { GameContainerFactory } from '../utils/GameContainerFactory.js';

var router = express.Router();

var gamesCounter = 0;

const STEP_PRS_FIRST = 1;

const registry = new RegistryService();
const gameFactory = new GameContainerFactory(registry); 

function createGame(playerOne, playerTwo, deckOne, deckTwo) {
	const game = gameFactory.createGameContainer(playerOne, playerTwo, deckOne, deckTwo);
	gamesCounter++;

	return game;
}

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

router.get(
	'/logs',
	ensure.ensureLoggedIn('/users/login'),
	async (_, res) => {
		readdir('./logs', (err, files) => {
			if (!err) {
				res.json(files.filter(file => file.endsWith('.log')).map(file => file.slice(0, -4)));
			} else {
				res.json(err);
			}
		});
	});

router.get(
	/^\/log\/([a-zA-Z0-9_-]+)\/?$/,
	ensure.ensureLoggedIn('/users/login'),
	async (req, res) => {
		const logId = req.params[0];
		readFile(`./logs/${logId}.log`, 'utf8', (err, data) => {
			if (err) {
				res.json(err);
			} else {
				const rawString = data.toString();
				const [initialStateRaw, actionLogRaw] = rawString.split('###');
				// console.log(actionLogRaw.trimEnd().slice(0, -1));
				res.json({
					state: JSON.parse(initialStateRaw),
					actions: JSON.parse(`[${actionLogRaw.trimEnd().slice(0, -1)}]`),
				});
			}
		});
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
	function(_req, res) {
		res.render('stats', {
			runningGames: [],
			gamesCounter,
		});
	}
);

router.get(/^\/game\/([a-zA-Z0-9_-]+)\/?$/,
	function(req, res) {
		const playerHash = req.params[0];

		console.log('');
		console.log(`Getting the player id from hash ${playerHash}`);
		console.dir(registry.gamePlayers);

		const gameId = registry.getGameIdByPlayerHash(playerHash);
		const playerId = registry.getPlayerIdByPlayerHash(playerHash);

		if (gameId && playerId) {
			const container = registry.getGame(gameId);
			if (!ioLaunched) {
				const io = req.app.get('io');

				io.on('connection', function(socket) {
					console.log('Connection event');
					const playerHash = socket.handshake.query.playerHash;

					const gameId = registry.getGameIdByPlayerHash(playerHash);
					const playerId = registry.getPlayerIdByPlayerHash(playerHash);
					if (gameId && playerId) {
						const socketContainer = registry.getGame(gameId);
						console.log(`Sent game id ${gameId}, player id ${playerId} [playerhash ${playerHash}]`);

						socketContainer.attachPlayerSocket(socket, playerId);
					}
				});

				ioLaunched = true;
			}

			res.render('game', {
				gameId,
				playerId,
				playerHash,
				initialState: container.gameState.serializeData(playerId),
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
		const participantHash = registry.getParticipant(req.user.gameId);
		if (participantHash) {
			res.json({hash: participantHash});
		} else {
			res.json(getChallenges());
		}
	}
);

router.post('/challenges',
	ensure.ensureLoggedIn('/users/login'),
	async (req, res) => {
		console.log('Creating the challenge.');
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

			// Player One is the one who created the game,
			// player two is the one who accepted it
			console.log(`Accepting the challenge. Creating game with players ${challenge.userId} and ${req.user.gameId}`);
			const gameContainer = createGame(
				challenge.userId,
				req.user.gameId,
				deckOne.cards,
				deckTwo.cards,
			);

			gameContainer.gameState.setup();
			// gameContainer.gameState.enableDebug();

			const gameId = gameContainer.gameId;

			open(joinPath(config.logDirectory, `${gameId}.log`), 'w', (err, file) => {
				if (!err) {
					const initialState = gameContainer.gameState.serializeData(1, false);
					write(file, JSON.stringify(initialState, null, 2) + '\n###\n', () => {
						gameContainer.events.on('action', action => {
							if (action.type !== 'display/priority') {
								try {
									const convertedAction = convertServerCommand(action, gameContainer.gameState, 1, true);
									write(file, JSON.stringify(convertedAction, null, 2) + ',\n', () => null);
								} catch(e) {
									console.log(`Error on serializing the action for the log: ${action.type}`);
									console.dir(action);
								}
							}
						});
						gameContainer.events.on('close', () => {
							close(file, () => null);
						});	
					});
				} else {
					console.log('===================');
					console.dir(err);
					console.log('===================');
				}
			});

			removeByName(challenge.user);
			removeByName(req.user.name);

			res.json({
				hash: gameContainer.playerHashes[req.user.gameId],
			});
		} else {
			res.json(getChallenges());
		}
		
	}
);

export const createZones = (player1, player2, creatures = [], activeMagi = []) => [
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

router.get('/test-state',
	async (_req, res) => {
		const ACTIVE_PLAYER = 212;
		const NON_ACTIVE_PLAYER = 510;

		const ulk = new CardInGame(byName('Ulk'), ACTIVE_PLAYER).addEnergy(15);
		const arbolit = new CardInGame(byName('Arbolit'), ACTIVE_PLAYER).addEnergy(5);
		const thunderquake = new CardInGame(byName('Thunderquake'), ACTIVE_PLAYER);
		const fireGrag = new CardInGame(byName('Fire Grag'), ACTIVE_PLAYER).addEnergy(4);
		const flameHyren = new CardInGame(byName('Flame Hyren'), ACTIVE_PLAYER).addEnergy(15);

		const adis = new CardInGame(byName('Adis'), NON_ACTIVE_PLAYER).addEnergy(3);
		const quorPup = new CardInGame(byName('Quor Pup'), NON_ACTIVE_PLAYER).addEnergy(6);
		const diobor = new CardInGame(byName('Diobor'), NON_ACTIVE_PLAYER).addEnergy(10);

		const zones = createZones(ACTIVE_PLAYER, NON_ACTIVE_PLAYER, [arbolit, fireGrag, quorPup, diobor, flameHyren], [ulk]);

		const gameState = new State({
			zones,
			step: STEP_PRS_FIRST,
			activePlayer: ACTIVE_PLAYER,
		});

		gameState.getZone(ZONE_TYPE_HAND, ACTIVE_PLAYER).add([thunderquake]);

		gameState.getZone(ZONE_TYPE_ACTIVE_MAGI, NON_ACTIVE_PLAYER).add([adis]);

		const spellAction = {
			type: ACTION_PLAY,
			payload: {
				player: ACTIVE_PLAYER,
				card: thunderquake,
			},
		};

		gameState.update(spellAction);

		const choosingCostAction = {
			type: ACTION_RESOLVE_PROMPT,
			number: 5,
			generatedBy: thunderquake.id,            
		};

		gameState.update(choosingCostAction);

		res.render('game', {
			gameId: 'testGameId',
			playerId: ACTIVE_PLAYER,
			playerHash: 'playerHash',
			initialState: gameState.serializeData(ACTIVE_PLAYER),
		});
	});

export default router;

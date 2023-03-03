import convertClientCommand from '../utils/convertClientCommand.js';
import convertServerCommand from '../utils/convertServerCommand.js';
import { EventEmitter } from 'events';
import {
	ACTION_PLAYER_WINS,
} from 'moonlands/dist/const.js';

export class GameContainer {
  gameState = null;
	gameId = '';
	events = null;
	playerHashes = {};

	constructor(gameState, gameId, registry) {
		this.gameState = gameState;
		this.gameId = gameId;
		this.events = new EventEmitter();
		this.registry = registry;
		gameState.setOnAction(action => {
			this.events.emit('action', action);

			if (action.type === ACTION_PLAYER_WINS) {
				this.clear();
			}
		});
	}

	setPlayerHash(playerId, playerHash) {
		this.playerHashes[playerId] = playerHash;
	}

	clear() {
		if (this.events) {
			this.events.removeAllListeners();
		} else {
			console.log(`No eventEmitter found for the game ${this.gameId}`);
		}
		Object.values(this.playerHashes).forEach(playerHash => {
			this.registry.unregisterPlayerHash(playerHash);
		});
		this.gameState.players.forEach(player => {
			this.registry.unregisterParticipant(player);
		});
	}

	getGameId() {
		return this.gameId;
	}

	getEmitter() {
		return this.events;
	}

	updateGameState(expandedAction) {
		this.gameState.update(expandedAction);
		this.events.emit('action', {
			type: 'display/priority',
			player: this.gameState.state.prompt ? this.gameState.state.promptPlayer : this.gameState.state.activePlayer,
			prompt: this.gameState.state.prompt,
		});
	}

	attachPlayerSocket(socket, playerId) {
		socket.emit('gameData', {
			playerId,
			state: this.gameState.serializeData(playerId),
		});
		// Converting game actions for sending
		this.events.on('action', action => {
			var convertedAction = null;
			try {
				convertedAction = convertServerCommand(action, this.gameState, playerId);
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
				socket.removeAllListeners();
				socket.disconnect();

				this.registry.unregisterPlayerHash(this.playerHashes[playerId]);
			}
		});

		// Converting client actions for game engine
		socket.on('clientAction', action => {
			// Only process active player actions or specifically requested prompt resolutions
			if (this.gameState.state.activePlayer === playerId ||
				(this.gameState.state.prompt && this.gameState.state.promptPlayer === playerId)) {
				let expandedAction = null;
				try {
					expandedAction = convertClientCommand({ ...action, player: playerId}, this.gameState);
				} catch(e) {
					console.log('Error converting client command');
					console.dir({ ...action, player: playerId});
				}

				try {
					this.updateGameState(expandedAction);
				} catch(e) {
					console.log('Engine error!');
					console.log('On action:');
					console.dir(expandedAction);

					console.log('');
					console.log(e.name);
					console.log(e.message);
					console.log(e.stack);
					process.exit(1);
				}
			}
		});
	}
}

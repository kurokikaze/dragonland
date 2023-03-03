export class RegistryService {
	// Player hash to game id, used to look up the game the specific playerhash is playing
	keyHash = {};

	// Player hash to player id in the game
	gamePlayers = {};

	// User ids to game hashes (used to check if the player participates in a game)
	participants = {}

	// Running games by ids
	runningGames = {};

	constructor() {}
	registerGameHashes(gameId, playerHashes) {
		for (let playerHash of playerHashes) {
			this.keyHash[playerHash] = gameId;
		}
	}

	getGameIdByPlayerHash(playerHash) {
		return this.keyHash[playerHash];
	}

	registerGamePlayer(playerHash, playerId) {
		this.gamePlayers[playerHash] = playerId;
	}

	getPlayerIdByPlayerHash(playerHash) {
		return this.gamePlayers[playerHash];
	}

	unregisterPlayerHash(playerHash) {
		delete this.keyHash[playerHash];
		delete this.gamePlayers[playerHash];
	}

	registerParticipant(userId, playerHash) {
		this.participants[userId] = playerHash;
	}

	getParticipant(userId) {
		return this.participants[userId];
	}

	unregisterParticipant(userId) {
		delete this.participants[userId];
	}

	registerGame(game, gameId) {
		this.runningGames[gameId] = game;
	}

	getGame(gameId) {
		return this.runningGames[gameId];
	}
}

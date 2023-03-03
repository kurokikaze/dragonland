import { nanoid } from 'nanoid';
import { State } from 'moonlands';
import { GameContainer } from './GameContainer';

export class GameContainerFactory {
	registry = null;
	constructor(registry) {
		this.registry = registry;
	}

	createGameContainer(playerOne, playerTwo, playerOneDeck, playerTwoDeck) {
		const gameId = nanoid();
		const playerOneHash = nanoid();
		const playerTwoHash = nanoid();

		this.registry.registerGameHashes(gameId, [playerOneHash, playerTwoHash]);

		this.registry.registerGamePlayer(playerOneHash, playerOne);
		this.registry.registerGamePlayer(playerTwoHash, playerTwo);
		
		const zones = [];

		const gameState = new State({
			zones,
			step: null,
			activePlayer: playerOne,
		});

		gameState.setPlayers(playerOne, playerTwo);

		gameState.setDeck(
			playerOne,
			playerOneDeck,
		);
	
		gameState.setDeck(
			playerTwo,
			playerTwoDeck,
		);

		const container = new GameContainer(gameState, gameId, this.registry);
		container.setPlayerHash(playerOne, playerOneHash);
		container.setPlayerHash(playerTwo, playerTwoHash);

		this.registry.registerGame(container, gameId);

		this.registry.registerParticipant(playerOne, playerOneHash);
		this.registry.registerParticipant(playerTwo, playerTwoHash);
		return container;
	}
}

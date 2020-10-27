import {
	ACTION_PLAY,
	ACTION_EFFECT,
	ACTION_PASS,
	ACTION_ATTACK,
	ACTION_ENTER_PROMPT,
	ACTION_RESOLVE_PROMPT,
	ACTION_PLAYER_WINS,
	ACTION_POWER,

	PROMPT_TYPE_NUMBER,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_MAGI,

	LOG_ENTRY_POWER_ACTIVATION,
	LOG_ENTRY_TARGETING,
	LOG_ENTRY_NUMBER_CHOICE,
	LOG_ENTRY_PLAY,
} from 'moonlands/src/const.js';

import {
	START_POWER_ANIMATION,
	END_POWER_ANIMATION,
	START_ATTACK_ANIMATION,
	END_ATTACK_ANIMATION,
	START_RELIC_ANIMATION,
	END_RELIC_ANIMATION,
	START_SPELL_ANIMATION,
	END_SPELL_ANIMATION,
	START_PROMPT_RESOLUTION_ANIMATION,
	END_PROMPT_RESOLUTION_ANIMATION,
} from '../actions';

import {
	MESSAGE_TYPE_POWER,
	MESSAGE_TYPE_RELIC,
	MESSAGE_TYPE_SPELL,
	MESSAGE_TYPE_PROMPT_RESOLUTION,
} from '../const.js';

import {applyEffect} from './applyEffect.js';
import {findInPlay} from './utils.js';

const defaultState = {
	zones: {
		playerHand: [],
		playerDeck: [],
		playerDiscard: [],
		playerActiveMagi: [],
		playerMagiPile: [],
		playerDefeatedMagi: [],
		playerInPlay: [],
		opponentHand: [],
		opponentDeck: [],
		opponentDiscard: [],
		opponentActiveMagi: [],
		opponentMagiPile: [],
		opponentDefeatedMagi: [],
		opponentInPlay: [],
	},
	staticAbilities: [],
	animation: null,
	message: {
		type: 'power',
		source: 'TestSource',
		power: {
			name: 'Power Name',
		},
	},
	log: [],
	gameEnded: false,
	winner: null,
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case ACTION_PLAY: {

			newLogEntry = {
				type: LOG_ENTRY_PLAY,
				card: action.payload.card.card,
				player: action.player,
			};

			return {
				...state,
				log: [...state.log, newLogEntry],
			};
		}
		case ACTION_PLAYER_WINS: {
			return {
				...state,
				gameEnded: true,
				winner: action.player,
			};
		}
		case ACTION_PASS: {
			return {
				...state,
				step: action.newStep,
			};
		}
		/* Animations */
		case START_POWER_ANIMATION: {
			return {
				...state,
				message: {
					type: MESSAGE_TYPE_POWER,
					source: action.source,
					power: action.power,
				},
			};
		}
		case END_POWER_ANIMATION: {
			return {
				...state,
				message: null,
			};
		}
		case START_ATTACK_ANIMATION: {
			return {
				...state,
				animation: {
					type: 'attack',
					source: action.source,
					target: action.target,
				},
			};
		}
		case END_ATTACK_ANIMATION: {
			return {
				...state,
				animation: null,
			};
		}
		case START_RELIC_ANIMATION: {
			return {
				...state,
				message: {
					type: MESSAGE_TYPE_RELIC,
					card: {
						...action.card,
						card: action.card._card.name,
					},
				},
			};
		}
		case END_RELIC_ANIMATION: {
			return {
				...state,
				message: null,
			};
		}
		case START_SPELL_ANIMATION: {
			return {
				...state,
				message: {
					type: MESSAGE_TYPE_SPELL,
					card: {
						...action.card,
						card: action.card._card.name,
					},
				},
			};
		}
		case END_SPELL_ANIMATION: {
			return {
				...state,
				message: null,
			};
		}
		/* End Animations */
		case ACTION_POWER: {
			const sourceId = action.source.id;
			const sourceName = action.power;
			var newLogEntry = null;

			const card = findInPlay(state, sourceId);

			if (card) {
				newLogEntry = {
					type: LOG_ENTRY_POWER_ACTIVATION,
					card: card.card,
					name: sourceName,
					player: action.player,
				};
			}

			return {
				...state,
				zones: {
					...state.zones,
					playerInPlay: state.zones.playerInPlay.map(
						card => card.id === sourceId
							? ({...card, data: {...card.data, actionsUsed: [...card.data.actionsUsed, sourceName]}})
							: card
					),
					opponentInPlay: state.zones.opponentInPlay.map(
						card => card.id === sourceId
							? ({...card, data: {...card.data, actionsUsed: [...card.data.actionsUsed, sourceName]}})
							: card
					),
					playerActiveMagi: state.zones.playerActiveMagi.map(
						card => card.id === sourceId
							? ({...card, data: {...card.data, actionsUsed: [...card.data.actionsUsed, sourceName]}})
							: card
					),
					opponentActiveMagi: state.zones.opponentActiveMagi.map(
						card => card.id === sourceId
							? ({...card, data: {...card.data, actionsUsed: [...card.data.actionsUsed, sourceName]}})
							: card
					),
				},
				log: card ? [...state.log, newLogEntry] : state.log,
			};
		}
		case ACTION_ENTER_PROMPT: {
			var promptParams = action.promptParams;
			switch (action.promptType) {
				case PROMPT_TYPE_NUMBER: {
					promptParams = {
						min: action.min,
						max: action.max
					};
					break;
				}
				case PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE: {
					promptParams = {
						source: action.source,
					};
					break;
				}
				case PROMPT_TYPE_SINGLE_CREATURE_FILTERED: {
					promptParams = {
						restrictions: action.restrictions,
						restriction: action.restriction,
						restrictionValue: action.restrictionValue,
					};
					break;
				}
				case PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE: {
					promptParams = {
						zone: action.zone,
						restrictions: action.restrictions,
						cards: action.cards,
						zoneOwner: action.zoneOwner,
						numberOfCards: action.numberOfCards,
					};
					break;
				}
			}
			return {
				...state,
				prompt: true,
				promptPlayer: action.player,
				promptType: action.promptType,
				promptMessage: action.message || null,
				promptParams,
				promptGeneratedBy: action.generatedBy,
				promptAvailableCards: action.availableCards || [],
			};
		}
		case START_PROMPT_RESOLUTION_ANIMATION: {
			var messageData = {...state.message};
			if (typeof action.target === 'number') {
				messageData = {
					type: MESSAGE_TYPE_PROMPT_RESOLUTION,
					chosenNumber: action.target,
				};
			} else {
				messageData = {
					type: MESSAGE_TYPE_PROMPT_RESOLUTION,
					chosenTarget: action.target,
				};
			}

			return {
				...state,
				message: messageData,
			};
		}
		case END_PROMPT_RESOLUTION_ANIMATION: {
			return {
				...state,
				message: null,
			};
		}
		case ACTION_RESOLVE_PROMPT: {
			var promptLogEntry = null;

			if (
				state.promptType === PROMPT_TYPE_SINGLE_CREATURE ||
				state.promptType === PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE ||
				state.promptType === PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI ||
				state.promptType === PROMPT_TYPE_OWN_SINGLE_CREATURE ||
				state.promptType === PROMPT_TYPE_SINGLE_MAGI
			) {
				const target = findInPlay(state, action.target.id);

				promptLogEntry = {
					type: LOG_ENTRY_TARGETING,
					card: target.card,
					player: action.player,
				};
			} else if (state.promptType === PROMPT_TYPE_NUMBER) {
				promptLogEntry = {
					type: LOG_ENTRY_NUMBER_CHOICE,
					number: action.number,
					player: action.player,
				};
			}

			return {
				...state,
				prompt: false,
				promptPlayer: null,
				promptType: null,
				promptParams: null,
				promptGeneratedBy: null,
				promptAvailableCards: null,
				log: promptLogEntry ? [...state.log, promptLogEntry] : state.log,
			};
		}
		case ACTION_ATTACK: {
			const attackerId = action.source.id;

			return {
				...state,
				zones: {
					...state.zones,
					playerInPlay: state.zones.playerInPlay.map(card =>
						card.id === attackerId ? ({
							...card,
							data: {
								...card.data,
								attacked: card.data.attacked + 1,
								hasAttacked: true,
							},
						}) : card,
					),
					opponentInPlay: state.zones.opponentInPlay.map(card =>
						card.id === attackerId ? ({
							...card,
							data: {
								...card.data,
								attacked: card.data.attacked + 1,
								hasAttacked: true,
							},
						}) : card,
					),
				},
			};
		}
		case ACTION_EFFECT: {
			return applyEffect(state, action);
		}
		default: {
			return state;
		}
	}
};

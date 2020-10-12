/* global window */
import {
	ACTION_PLAY,
	ACTION_EFFECT,
	ACTION_PASS,
	ACTION_ATTACK,
	ACTION_ENTER_PROMPT,
	ACTION_RESOLVE_PROMPT,
	ACTION_PLAYER_WINS,
	ACTION_POWER,

	TYPE_CREATURE,
	TYPE_MAGI,
	TYPE_RELIC,

	EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
	EFFECT_TYPE_ADD_ENERGY_TO_CREATURE,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE,
	EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,
	EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL,
	EFFECT_TYPE_PAYING_ENERGY_FOR_POWER,
	EFFECT_TYPE_START_OF_TURN,
	EFFECT_TYPE_MOVE_ENERGY,
	EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
	EFFECT_TYPE_DISCARD_CREATURE_FROM_PLAY,
	EFFECT_TYPE_CREATURE_ATTACKS,
	EFFECT_TYPE_DRAW,
	EFFECT_TYPE_MAGI_IS_DEFEATED,
	EFFECT_TYPE_FORBID_ATTACK_TO_CREATURE,

	PROMPT_TYPE_NUMBER,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_MAGI,

	ZONE_TYPE_ACTIVE_MAGI,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_DEFEATED_MAGI,
	ZONE_TYPE_DECK,
	ZONE_TYPE_DISCARD,
	ZONE_TYPE_HAND,
	ZONE_TYPE_IN_PLAY,

	LOG_ENTRY_POWER_ACTIVATION,
	LOG_ENTRY_TARGETING,
	LOG_ENTRY_NUMBER_CHOICE,
	LOG_ENTRY_CREATURE_ENERGY_LOSS,
	LOG_ENTRY_CREATURE_ENERGY_GAIN,
	LOG_ENTRY_ATTACK,
	LOG_ENTRY_PLAY,
	LOG_ENTRY_DRAW,
	LOG_ENTRY_CREATURE_DISCARDED_FROM_PLAY,
	LOG_ENTRY_MAGI_ENERGY_LOSS,
	LOG_ENTRY_MAGI_ENERGY_GAIN,
	LOG_ENTRY_MAGI_DEFEATED,
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

import {byName} from 'moonlands/src/cards';

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
	currentStaticAbilities: [],
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

const clientZoneNames = {
	[ZONE_TYPE_DECK]: 'Deck',
	[ZONE_TYPE_HAND]: 'Hand',
	[ZONE_TYPE_DISCARD]: 'Discard',
	[ZONE_TYPE_ACTIVE_MAGI]: 'ActiveMagi',
	[ZONE_TYPE_MAGI_PILE]: 'MagiPile',
	[ZONE_TYPE_DEFEATED_MAGI]: 'DefeatedMagi',
	[ZONE_TYPE_IN_PLAY]: 'InPlay',
};

const getZoneName = (serverZoneType, source) => {
	if (!clientZoneNames[serverZoneType]) {
		throw new Error(`Unknown zone: ${serverZoneType}`);
	}

	const zonePrefix = source.owner === window.playerId ? 'player' : 'opponent';
	const zoneName = clientZoneNames[serverZoneType];
	return `${zonePrefix}${zoneName}`;
};

const findInPlay = (state, id) => {
	const cardPlayerInPlay = state.zones.playerInPlay.find(card => card.id === id);
	if (cardPlayerInPlay) return cardPlayerInPlay;

	const cardOpponentInPlay = state.zones.opponentInPlay.find(card => card.id === id);
	if (cardOpponentInPlay) return cardOpponentInPlay;

	const cardPlayerMagi = state.zones.playerActiveMagi.find(card => card.id === id);
	if (cardPlayerMagi) return cardPlayerMagi;

	const cardOpponentMagi = state.zones.opponentActiveMagi.find(card => card.id === id);
	if (cardOpponentMagi) return cardOpponentMagi;

	return null;
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
			switch(action.effectType) {
				case EFFECT_TYPE_DRAW: {
					const drawLogEntry = {
						type: LOG_ENTRY_DRAW,
						player: action.player,
					};

					return {
						...state,
						log: [...state.log, drawLogEntry],
					};
				}
				case EFFECT_TYPE_DISCARD_CREATURE_FROM_PLAY: {
					const discardTarget = findInPlay(state, action.target.id);
					
					const discardLogEntry = {
						type: LOG_ENTRY_CREATURE_DISCARDED_FROM_PLAY,
						card: discardTarget.card,
						player: action.player,
					};

					return {
						...state,
						log: [...state.log, discardLogEntry],
					};
				}
				case EFFECT_TYPE_CREATURE_ATTACKS: {
					const attackSource = findInPlay(state, action.source.id);
					const attackTarget = findInPlay(state, action.target.id);

					const attackLogEntry = {
						type: LOG_ENTRY_ATTACK,
						player: action.player,
						source: attackSource.card,
						target: attackTarget.card,
					};

					return {
						...state,
						log: [...state.log, attackLogEntry],
					};
				}
				case EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES: {
					const zonesToConsiderForStaticAbilities = new Set(['playerInPlay', 'opponentInPlay', 'playerActiveMagi', 'opponentActiveMagi']);
					const sourceZone = getZoneName(action.sourceZone, action.sourceCard);
					const destinationZone = getZoneName(action.destinationZone, action.destinationCard);

					var staticAbilities = state.staticAbilities || [];

					if (zonesToConsiderForStaticAbilities.has(sourceZone)) {
						// We are removing card with static ability from the play
						staticAbilities = staticAbilities.filter(card => card.id !== action.sourceCard.id);
					} else if (zonesToConsiderForStaticAbilities.has(destinationZone) && byName(action.destinationCard.card).data.staticAbilities) {
						staticAbilities.push({
							...action.destinationCard,
							card: byName(action.destinationCard.card),
						});
					}
					return {
						...state,
						staticAbilities,
						zones: {
							...state.zones,
							[sourceZone]: state.zones[sourceZone].filter(card => card.id !== action.sourceCard.id),
							[destinationZone]: [...state.zones[destinationZone], action.destinationCard],
						},
					};
				}
				case EFFECT_TYPE_START_OF_TURN: {
					if (action.player === window.playerId) {
						return {
							...state,
							zones: {
								...state.zones,
								playerInPlay: state.zones.playerInPlay.map(card => ({...card, data: {...card.data, attacked: 0, hasAttacked: false, wasAttacked: false, actionsUsed: []}})),
								playerActiveMagi: state.zones.playerActiveMagi.map(card => ({...card, data: {...card.data, wasAttacked: false, actionsUsed: []}})),
							},
							activePlayer: action.player,
						};
					} else {
						return {
							...state,
							activePlayer: action.player,
						};
					}
				}
				case EFFECT_TYPE_PAYING_ENERGY_FOR_POWER: {
					const targetBaseCard = byName(action.target.card);
					switch (targetBaseCard.type) {
						case TYPE_CREATURE: {
							// creature pays for the ability
							return state;
						}
						case TYPE_MAGI: {
							const playerActiveMagi = [...(state.zones.playerActiveMagi || [])]
								.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);
							const opponentActiveMagi = [...(state.zones.opponentActiveMagi || [])]
								.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);
							
							return {
								...state,
								zones: {
									...state.zones,
									playerActiveMagi,
									opponentActiveMagi,
								},
							};
						}
						case TYPE_RELIC: {
							// magi pays for the ability
							if (action.target.owner == window.playerId) {
								const playerActiveMagi = state.zones.playerActiveMagi
									.map(card => ({
										...card,
										data: {
											...card.data,
											energy: card.data.energy - action.amount,
										},
									}));
								return {
									...state,
									zones: {
										...state.zones,
										playerActiveMagi,
									},
								};
							} else {
								const opponentActiveMagi = state.zones.opponentActiveMagi
									.map(card => ({
										...card,
										data: {
											...card.data,
											energy: card.data.energy - action.amount,
										},
									}));
								return {
									...state,
									zones: {
										...state.zones,
										opponentActiveMagi,
									},
								};
							}
						}
					}
					// No idea what that was
					return state; 
				}
				case EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL: {
					const playerActiveMagi = [...(state.zones.playerActiveMagi || [])]
						.map(card => card.id == action.from.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);
					const opponentActiveMagi = [...(state.zones.opponentActiveMagi || [])]
						.map(card => card.id == action.from.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerActiveMagi,
							opponentActiveMagi,
						},
					};
				}
				case EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE: {
					const playerActiveMagi = [...(state.zones.playerActiveMagi || [])]
						.map(card => card.id == action.from.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);
					const opponentActiveMagi = [...(state.zones.opponentActiveMagi || [])]
						.map(card => card.id == action.from.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerActiveMagi,
							opponentActiveMagi,
						},
					};
				}
				case EFFECT_TYPE_FORBID_ATTACK_TO_CREATURE: {
					const playerInPlay = [...state.zones.playerInPlay].map(
						card => card.id === action.target.id ?
							{...card, data: {...card.data, attacked: Infinity}} :
							card,
					);
					const opponentInPlay = [...state.zones.opponentInPlay].map(
						card => card.id === action.target.id ?
							{...card, data: {...card.data, attacked: Infinity}} :
							card,
					);
					return {
						...state,
						zones: {
							...state.zones,
							playerInPlay,
							opponentInPlay,
						},
					};
				}
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE: {
					const idsToFind = action.target.length ? action.target.map(({id}) => id) : [action.target.id];

					const newLogEntries = idsToFind.map(id => findInPlay(state, id)).filter(Boolean).map(card => ({type: LOG_ENTRY_CREATURE_ENERGY_LOSS, card: card.card, amount: action.amount}));

					const playerInPlay = [...state.zones.playerInPlay].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: Math.max(card.data.energy - action.amount, 0)}} : card);
					const opponentInPlay = [...state.zones.opponentInPlay].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: Math.max(card.data.energy - action.amount, 0)}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerInPlay,
							opponentInPlay,
						},
						log: [...state.log, ...newLogEntries],
					};                    
				}
                
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI: {
					const magiFound = findInPlay(state, action.target.id);
					const newLogEntry = {
						type: LOG_ENTRY_MAGI_ENERGY_LOSS,
						card: magiFound.card,
						amount: action.amount,
					};

					const playerActiveMagi = [...state.zones.playerActiveMagi].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: Math.max(card.data.energy - action.amount, 0)}} : card);
					const opponentActiveMagi = [...state.zones.opponentActiveMagi].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: Math.max(card.data.energy - action.amount, 0)}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerActiveMagi,
							opponentActiveMagi,
						},
						log: [...state.log, newLogEntry],
					};
				}
				case EFFECT_TYPE_MOVE_ENERGY: {
					const playerActiveMagi = [...state.zones.playerActiveMagi]
						.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card)
						.map(card => card.id == action.source.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

					const opponentActiveMagi = [...state.zones.opponentActiveMagi]
						.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card)
						.map(card => card.id == action.source.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

					const playerInPlay = [...(state.zones.playerInPlay || [])]
						.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card)
						.map(card => card.id == action.source.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

					const opponentInPlay = [...(state.zones.opponentInPlay || [])]
						.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card)
						.map(card => card.id == action.source.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerActiveMagi,
							opponentActiveMagi,
							playerInPlay,
							opponentInPlay,
						},
					};
				}
				case EFFECT_TYPE_MAGI_IS_DEFEATED: {
					const magiDefeatEntry = {
						type: LOG_ENTRY_MAGI_DEFEATED,
						card: action.target.card,
					};

					return {
						...state,
						log: [...state.log, magiDefeatEntry],
					};
				}
				case EFFECT_TYPE_ADD_ENERGY_TO_CREATURE: {
					const idsToFind = action.target.length ? action.target.map(({id}) => id) : [action.target.id];

					const newLogEntries = idsToFind.map(id => findInPlay(state, id)).filter(Boolean).map(card => ({type: LOG_ENTRY_CREATURE_ENERGY_GAIN, card: card.card, amount: action.amount}));

					const playerInPlay = [...(state.zones.playerInPlay || [])].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);
					const opponentInPlay = [...(state.zones.opponentInPlay || [])].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerInPlay,
							opponentInPlay,
						},
						log: [...state.log, ...newLogEntries],
					};
				}
				case EFFECT_TYPE_ADD_ENERGY_TO_MAGI: {
					const magiFound = findInPlay(state, action.target.id);
					const newLogEntry = magiFound ? {
						type: LOG_ENTRY_MAGI_ENERGY_GAIN,
						card: magiFound.card,
						amount: action.amount,
					} : null;
					const playerActiveMagi = [...(state.zones.playerActiveMagi || [])]
						.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);
					const opponentActiveMagi = [...(state.zones.opponentActiveMagi || [])]
						.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerActiveMagi,
							opponentActiveMagi,
						},
						log: newLogEntry ? [...state.log, newLogEntry] : state.log,
					};
				}
			}
			return state;
		}
		default: {
			return state;
		}
	}
};
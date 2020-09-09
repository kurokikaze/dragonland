/* global window */
import {
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

	PROMPT_TYPE_NUMBER,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,

	ZONE_TYPE_ACTIVE_MAGI,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_DEFEATED_MAGI,
	ZONE_TYPE_DECK,
	ZONE_TYPE_DISCARD,
	ZONE_TYPE_HAND,
	ZONE_TYPE_IN_PLAY,
} from 'moonlands/src/const.js';

import {
	START_POWER_ANIMATION,
	END_POWER_ANIMATION,
	START_ATTACK_ANIMATION,
	END_ATTACK_ANIMATION,
} from '../actions';

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
	animation: null,
	message: {
		type: 'power',
		source: 'TestSource',
		power: {
			name: 'Power Name',
		},
	},
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

export default (state = defaultState, action) => {
	switch (action.type) {
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
		case START_POWER_ANIMATION: {
			return {
				...state,
				message: {
					type: 'power',
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
		case ACTION_POWER: {
			const sourceId = action.source.id;
			const sourceName = action.power;
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
		case ACTION_RESOLVE_PROMPT: {
			return {
				...state,
				prompt: false,
				promptPlayer: null,
				promptType: null,
				promptParams: null,
				promptGeneratedBy: null,
				promptAvailableCards: null,
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
				case EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES: {
					const sourceZone = getZoneName(action.sourceZone, action.sourceCard);
					const destinationZone = getZoneName(action.destinationZone, action.destinationCard);

					return {
						...state,
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
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE: {
					const idsToFind = action.target.length ? action.target.map(({id}) => id) : [action.target.id];

					const playerInPlay = [...state.zones.playerInPlay].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);
					const opponentInPlay = [...state.zones.opponentInPlay].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerInPlay,
							opponentInPlay,
						},
					};                    
				}
                
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI: {
					const playerActiveMagi = [...state.zones.playerActiveMagi].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);
					const opponentActiveMagi = [...state.zones.opponentActiveMagi].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerActiveMagi,
							opponentActiveMagi,
						},
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
				case EFFECT_TYPE_ADD_ENERGY_TO_CREATURE: {
					const idsToFind = action.target.length ? action.target.map(({id}) => id) : [action.target.id];
					const playerInPlay = [...(state.zones.playerInPlay || [])].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);
					const opponentInPlay = [...(state.zones.opponentInPlay || [])].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);

					return {
						...state,
						zones: {
							...state.zones,
							playerInPlay,
							opponentInPlay,
						},
					};
				}                
				case EFFECT_TYPE_ADD_ENERGY_TO_MAGI: {
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
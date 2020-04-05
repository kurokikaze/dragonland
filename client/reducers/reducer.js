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
} from 'moonlands/src/const';

import {byName} from 'moonlands/src/cards';

const TYPE_DISPLAY = 'actions/display';

const SUBTYPE_ZONE_UPDATE = 'subtypes/zone_update';

const zoneNames = {
	[ZONE_TYPE_ACTIVE_MAGI]: 'ActiveMagi',
	[ZONE_TYPE_MAGI_PILE]: 'MagiPile',
	[ZONE_TYPE_DEFEATED_MAGI]: 'DefeatedMagi',
	[ZONE_TYPE_DECK]: 'Deck',
	[ZONE_TYPE_DISCARD]: 'Discard',
	[ZONE_TYPE_HAND]: 'Hand',
	[ZONE_TYPE_IN_PLAY]: 'InPlay',
};

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
	gameEnded: false,
	winner: null,
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
						card.data.id === attackerId ? ({
							...card,
							data: {
								...card.data,
								attacked: card.data.attacked + 1,
								hasAttacked: true,
							},
						}) : card,
					),
					opponentInPlay: state.zones.opponentInPlay.map(card =>
						card.data.id === attackerId ? ({
							...card,
							data: {
								...card.data,
								attacked: card.data.attacked + 1,
								hasAttacked: true,
							},
						}) : card,
					),
				},
				activePlayer: action.player,
			};
		}
		case ACTION_EFFECT: {
			switch(action.effectType) {
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
							if (action.target.data.controller == window.playerId) {
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
		case TYPE_DISPLAY: {
			switch (action.subtype) {
				case SUBTYPE_ZONE_UPDATE: {
					console.log('Zone update');
					if (action.zoneType == ZONE_TYPE_IN_PLAY) {
						return {
							...state,
							zones: {
								...state.zones,
								playerInPlay: action.content.filter(card => card.data.controller == window.playerId),
								opponentInPlay: action.content.filter(card => card.data.controller != window.playerId),
							},
						};
					} else {
						const zoneName = zoneNames[action.zoneType];
						const ownerName = action.player == window.playerId ? 'player' : 'opponent';

						const zoneId = `${ownerName}${zoneName}`;

						return {
							...state,
							zones: {
								...state.zones,
								[zoneId]: action.content,
							},
						};
					}
				}
			}
			break;
		}
		default: {
			return state;
		}
	}
	return state;
};
/* global window */
import {
	ACTION_EFFECT,
	ACTION_PASS,
	ACTION_ENTER_PROMPT,
	ACTION_RESOLVE_PROMPT,
	ACTION_PLAYER_WINS,

	EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
	EFFECT_TYPE_ADD_ENERGY_TO_CREATURE,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE,
	EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,
	EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL,
	EFFECT_TYPE_START_OF_TURN,
	EFFECT_TYPE_MOVE_ENERGY,

	PROMPT_TYPE_NUMBER,

	// TYPE_CREATURE,

	ZONE_TYPE_ACTIVE_MAGI,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_DEFEATED_MAGI,
	ZONE_TYPE_DECK,
	ZONE_TYPE_DISCARD,
	ZONE_TYPE_HAND,
	ZONE_TYPE_IN_PLAY,
} from 'moonlands/src/const';

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

export default (state = {}, action) => {
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
		case ACTION_ENTER_PROMPT: {
			var promptParams = action.promptParams;
			switch (action.promptType) {
				case PROMPT_TYPE_NUMBER:
					promptParams = {
						min: action.min,
						max: action.max
					};
			}
			return {
				...state,
				prompt: true,
				promptPlayer: action.player,
				promptType: action.promptType,
				promptParams,
				promptGeneratedBy: action.generatedBy,
				promptAvailableCards: action.availableCards || null,
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
		case ACTION_EFFECT: {
			switch(action.effectType) {
				case EFFECT_TYPE_START_OF_TURN: {
					if (action.player === window.playerId) {
						return {
							...state,
							zones: {
								...state.zones,
								playerInPlay: state.zones.playerInPlay.map(card => ({...card, data: {...card.data, attacked: 0, hasAttacked: false, wasAttacked: false}})),
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
					const playerInPlay = [...state.zones.playerInPlay].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);
					const opponentInPlay = [...state.zones.opponentInPlay].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

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
					const playerInPlay = [...(state.zones.playerInPlay || [])].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);
					const opponentInPlay = [...(state.zones.opponentInPlay || [])].map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);

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
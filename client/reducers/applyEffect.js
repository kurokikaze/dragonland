/* global window */
import {
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

	LOG_ENTRY_CREATURE_ENERGY_LOSS,
	LOG_ENTRY_CREATURE_ENERGY_GAIN,
	LOG_ENTRY_ATTACK,

	LOG_ENTRY_DRAW,
	LOG_ENTRY_CREATURE_DISCARDED_FROM_PLAY,
	LOG_ENTRY_MAGI_ENERGY_LOSS,
	LOG_ENTRY_MAGI_ENERGY_GAIN,
	LOG_ENTRY_MAGI_DEFEATED,
} from 'moonlands/src/const.js';

import {byName} from 'moonlands/src/cards';

import {findInPlay, getZoneName} from './utils.js';

const zonesToConsiderForStaticAbilities = new Set(['playerInPlay', 'opponentInPlay', 'playerActiveMagi', 'opponentActiveMagi']);

export function applyEffect(state, action) {
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

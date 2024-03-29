/* global window */
import { nanoid } from 'nanoid';
import {
	EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
	EFFECT_TYPE_ADD_ENERGY_TO_CREATURE,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE,
	EFFECT_TYPE_REMOVE_ENERGY_FROM_CREATURE,
	EFFECT_TYPE_REMOVE_ENERGY_FROM_MAGI,
	EFFECT_TYPE_START_OF_TURN,
	EFFECT_TYPE_MOVE_ENERGY,
	EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
	EFFECT_TYPE_DISCARD_CREATURE_FROM_PLAY,
	EFFECT_TYPE_CREATURE_ATTACKS,
	EFFECT_TYPE_DRAW,
	EFFECT_TYPE_MAGI_IS_DEFEATED,
	EFFECT_TYPE_FORBID_ATTACK_TO_CREATURE,
	EFFECT_TYPE_REARRANGE_ENERGY_ON_CREATURES,
	EFFECT_TYPE_END_OF_TURN,
	EFFECT_TYPE_CREATE_CONTINUOUS_EFFECT,
	EFFECT_TYPE_DISCARD_RESHUFFLED,
	EFFECT_TYPE_REARRANGE_CARDS_OF_ZONE,

	LOG_ENTRY_CREATURE_ENERGY_LOSS,
	LOG_ENTRY_CREATURE_ENERGY_GAIN,
	LOG_ENTRY_ATTACK,

	LOG_ENTRY_DRAW,
	LOG_ENTRY_CREATURE_DISCARDED_FROM_PLAY,
	LOG_ENTRY_MAGI_ENERGY_LOSS,
	LOG_ENTRY_MAGI_ENERGY_GAIN,
	LOG_ENTRY_MAGI_DEFEATED,
	ZONE_TYPE_DECK,
} from 'moonlands/dist/const';

import {byName} from 'moonlands/dist/cards';

import {findInPlay, getZoneName} from './utils.js';

const zonesToConsiderForStaticAbilities = new Set(['inPlay', 'opponentInPlay', 'playerActiveMagi', 'opponentActiveMagi']);

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
      
			if (!discardTarget) {
				console.error('Target was already discarded in log creation');
			}
			const discardLogEntry = {
				type: LOG_ENTRY_CREATURE_DISCARDED_FROM_PLAY,
				card: discardTarget ? discardTarget.card : 'Card',
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

			if (attackSource && attackTarget) {
				const attackLogEntry = {
					type: LOG_ENTRY_ATTACK,
					player: action.player,
					source: attackSource.card,
					target: attackTarget.card,
					packHuntAttack: action.packHuntAttack,
				};

				return {
					...state,
					log: [...state.log, attackLogEntry],
				};
			}

			return state;					
		}
		case EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES: {
			const sourceZone = getZoneName(action.sourceZone, action.sourceCard);
			const destinationZone = getZoneName(action.destinationZone, action.destinationCard);

			var packs = [ ...state.packs];
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
			if (sourceZone === 'inPlay' && action.sourceCard.data.controller === window.playerId) {
				packs = packs.filter(({ leader }) => leader !== action.sourceCard.id);
			}
			return {
				...state,
				staticAbilities,
				zones: {
					...state.zones,
					[sourceZone]: state.zones[sourceZone].filter(card => card.id !== action.sourceCard.id),
					[destinationZone]: [...state.zones[destinationZone], action.destinationCard],
				},
				packs,
			};
		}
		case EFFECT_TYPE_START_OF_TURN: {
			if (action.player === window.playerId) {
				return {
					...state,
					zones: {
						...state.zones,
						inPlay: state.zones.inPlay.map(card => card.data.controller === state.playerId ? ({...card, data: {...card.data, attacked: 0, hasAttacked: false, wasAttacked: false, actionsUsed: []}}) : card),
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
		case EFFECT_TYPE_END_OF_TURN: {
			return {
				...state,
				turnTimer: false, 
			};
		}

		case EFFECT_TYPE_REMOVE_ENERGY_FROM_CREATURE: {
			const idToFind = action.target.id;

			const creature = findInPlay(state, idToFind);
			if (!creature) {
				return state;
			}
			const newLogEntry = {type: LOG_ENTRY_CREATURE_ENERGY_LOSS, card: creature.card, amount: action.amount};

			const inPlay = [...state.zones.inPlay].map(card => card.id === idToFind ? {...card, data: {...card.data, energy: Math.max(card.data.energy - action.amount, 0)}} : card);

			return {
				...state,
				zones: {
					...state.zones,
					inPlay,
				},
				log: [...state.log, newLogEntry],
			};    
		}
		case EFFECT_TYPE_FORBID_ATTACK_TO_CREATURE: {
			const inPlay = [...state.zones.inPlay].map(
				card => card.id === action.target.id ?
					{...card, data: {...card.data, attacked: Infinity}} :
					card,
			);

			return {
				...state,
				zones: {
					...state.zones,
					inPlay,
				},
			};
		}
		case EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE: {
			const idsToFind = action.target.length ? action.target.map(({id}) => id) : [action.target.id];

			const newLogEntries = idsToFind.map(id => findInPlay(state, id)).filter(Boolean).map(card => ({type: LOG_ENTRY_CREATURE_ENERGY_LOSS, card: card.card, amount: action.amount}));

			const inPlay = [...state.zones.inPlay].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: Math.max(card.data.energy - action.amount, 0)}} : card);

			return {
				...state,
				zones: {
					...state.zones,
					inPlay,
				},
				log: [...state.log, ...newLogEntries],
			};                    
		}
		case EFFECT_TYPE_REARRANGE_CARDS_OF_ZONE: {
			if (action.zone === ZONE_TYPE_DECK) {
				switch (action.zoneOwner) {
					case state.activePlayer: {
						const cardsToRearrange = state.zones.playerDeck.slice(0, action.cards.length);
						const cardsRecord = {};
						cardsToRearrange.forEach(card => {
							cardsRecord[card.id] = card;
						});
						return {
							...state,
							zones: {
								...state.zones,
								playerDeck: state.zones.playerDeck.map((card, index) => {
									if (index < action.cards.length) {
										const idAtPosition = action.cards[index];
										return cardsRecord[idAtPosition];
									} else {
										return card;
									}
								})
							}
						};
					}
					default: {
						const cardsToRearrange = state.zones.opponentDeck.slice(0, action.cards.length);
						const cardsRecord = {};
						cardsToRearrange.forEach(card => {
							cardsRecord[card.id] = card;
						});
						return {
							...state,
							zones: {
								...state.zones,
								opponentDeck: state.zones.opponentDeck.map((card, index) => {
									if (index < action.cards.length) {
										const idAtPosition = action.cards[index];
										return cardsRecord[idAtPosition];
									} else {
										return card;
									}
								})
							}
						};
					}
				}
			}
			return {
				...state,
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
		case EFFECT_TYPE_REMOVE_ENERGY_FROM_MAGI: {
			const magiFound = findInPlay(state, action.target.id);
			const newLogEntry = {
				type: LOG_ENTRY_MAGI_ENERGY_LOSS,
				card: magiFound.card,
				amount: action.amount,
			};

			if (state.zones.playerActiveMagi.length && state.zones.playerActiveMagi[0].id === action.target.id) {
				return {
					...state,
					zones: {
						...state.zones,
						playerActiveMagi: state.zones.playerActiveMagi.map(card => ({...card, data: {...card.data, energy: Math.max(card.data.energy - action.amount, 0)}})),
					},
					log: [...state.log, newLogEntry],
				};
			} else if (state.zones.opponentActiveMagi.length && state.zones.opponentActiveMagi[0].id === action.target.id) {
				return {
					...state,
					zones: {
						...state.zones,
						opponentActiveMagi: state.zones.opponentActiveMagi.map(card => ({...card, data: {...card.data, energy: Math.max(card.data.energy - action.amount, 0)}})),
					},
					log: [...state.log, newLogEntry],
				};
			}
			return state;
		}
		case EFFECT_TYPE_MOVE_ENERGY: {
			const playerActiveMagi = [...state.zones.playerActiveMagi]
				.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card)
				.map(card => card.id == action.source.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

			const opponentActiveMagi = [...state.zones.opponentActiveMagi]
				.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card)
				.map(card => card.id == action.source.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

			const inPlay = [...(state.zones.inPlay || [])]
				.map(card => card.id == action.target.id ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card)
				.map(card => card.id == action.source.id ? {...card, data: {...card.data, energy: card.data.energy - action.amount}} : card);

			return {
				...state,
				zones: {
					...state.zones,
					playerActiveMagi,
					opponentActiveMagi,
					inPlay,
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

			const inPlay = [...(state.zones.inPlay || [])].map(card => idsToFind.includes(card.id) ? {...card, data: {...card.data, energy: card.data.energy + action.amount}} : card);

			return {
				...state,
				zones: {
					...state.zones,
					inPlay,
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
		case EFFECT_TYPE_REARRANGE_ENERGY_ON_CREATURES: {
			const ids = Object.keys(action.energyOnCreatures);
			return {
				...state,
				zones: {
					...state.zones,
					inPlay: state.zones.inPlay.map(cardInPlay => ids.includes(cardInPlay.id) ? { ...cardInPlay, data: { ...cardInPlay.data, energy: action.energyOnCreatures[cardInPlay.id]}}: cardInPlay)
				},
			};
		}
		case EFFECT_TYPE_CREATE_CONTINUOUS_EFFECT: {
			return {
				...state,
				continuousEffects: [
					...state.continuousEffects,
					{
						generatedBy: action.generatedBy,
						expiration: action.expiration,
						staticAbilities: action.staticAbilities || [],
						triggerEffects: action.triggerEffects || [],
						player: action.player,
						id: nanoid(),
					},
				],
			};
		}
		case EFFECT_TYPE_DISCARD_RESHUFFLED: {
			const newState = action.player === window.playerId ? {
				...state,
				zones: {
					...state.zones,
					playerDiscard: [],
					playerDeck: action.cards.map(cardId => ({id: cardId, owner: action.player, card: null, data: null})),
				},
			} : {
				...state,
				zones: {
					...state.zones,
					opponentDiscard: [],
					opponentDeck: action.cards.map(cardId => ({id: cardId, owner: action.player, card: null, data: null})),
				},
			};
			return newState;
		}
	}
	return state;
}

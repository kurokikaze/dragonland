import {
	ACTION_PASS,
	ACTION_PLAY,
	ACTION_ENTER_PROMPT,
	ACTION_EFFECT,
	ACTION_POWER,
	ACTION_ATTACK,

	PROMPT_TYPE_NUMBER,
	PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
	PROMPT_TYPE_CHOOSE_UP_TO_N_CARDS_FROM_ZONE,
	PROMPT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES,
	PROMPT_TYPE_REARRANGE_ENERGY_ON_CREATURES,
	PROMPT_TYPE_REARRANGE_CARDS_OF_ZONE,

	EFFECT_TYPE_ADD_ENERGY_TO_MAGI,
	EFFECT_TYPE_PAYING_ENERGY_FOR_POWER,
	EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE,
	EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI,
	EFFECT_TYPE_DISCARD_CREATURE_FROM_PLAY,
	EFFECT_TYPE_MOVE_ENERGY,
	EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE,
	EFFECT_TYPE_ADD_ENERGY_TO_CREATURE,
	EFFECT_TYPE_ATTACK,
	EFFECT_TYPE_CREATURE_ATTACKS,
	EFFECT_TYPE_MAGI_IS_DEFEATED,
	EFFECT_TYPE_FORBID_ATTACK_TO_CREATURE,
	EFFECT_TYPE_REARRANGE_ENERGY_ON_CREATURES,
	EFFECT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES,
	EFFECT_TYPE_PLAY_CREATURE,
	EFFECT_TYPE_DISCARD_RESHUFFLED,
	EFFECT_TYPE_REARRANGE_CARDS_OF_ZONE,
	EFFECT_TYPE_MOVE_CARD_BETWEEN_ZONES,
	EFFECT_TYPE_MOVE_CARDS_BETWEEN_ZONES,
	EFFECT_TYPE_DAMAGE_STEP,
	EFFECT_TYPE_DEAL_DAMAGE,
	EFFECT_TYPE_DEFENDER_DEALS_DAMAGE,

	ZONE_TYPE_DECK,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_HAND,
	EFFECT_TYPE_ATTACKER_DEALS_DAMAGE,
	EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE_OR_MAGI,
	EFFECT_TYPE_BEFORE_DAMAGE,
	EFFECT_TYPE_CREATURE_DEFEATS_CREATURE,
	EFFECT_TYPE_CREATURE_IS_DEFEATED,
	EFFECT_TYPE_RETURN_CREATURE_RETURNING_ENERGY,
	EFFECT_TYPE_REMOVE_ENERGY_FROM_CREATURE,
	EFFECT_TYPE_REMOVE_ENERGY_FROM_MAGI,
} from 'moonlands/dist/const.js';

import {clone} from './index.js';

const hiddenZonesHash = {
	[ZONE_TYPE_DECK]: true,
	[ZONE_TYPE_MAGI_PILE]: true,
	[ZONE_TYPE_HAND]: true,
};

const NUMBER_OF_STEPS = 6;

const index = (obj, is, value) => {
	if (typeof is == 'string')
		is =is.split('.');
	if (is.length == 1 && value !== undefined)
		return obj[is[0]] = value;
	else if (is.length == 0)
		return obj;
	else
		return index(obj[is[0]], is.slice(1), value);
};

const templateMessage = (message, metadata) => {
	return message.replace(/\$\{(.+?)\}/g, (_match, p1) => index(metadata, p1));
};

const convertCard = cardInGame => ({
	id: cardInGame.id,
	owner: cardInGame.owner,
	card: cardInGame._card.name,
	data: cardInGame.data,
});

const convertCardMinimal = cardInGame => ({
	id: cardInGame.id,
});

export const hideIfNecessary = (card, targetZone, isOpponent) => {
	if (hiddenZonesHash[targetZone] && isOpponent) {
		return {
			...card,
			card: null,
			data: null,
		};
	} else {
		return card;
	}
};

function convertServerCommand(initialAction, game, playerId, overrideHiding = false) {

	var action = clone(initialAction);
	switch(action.type) {
		case ACTION_PASS: {
			const step = game.state.step;

			const newStep = (step === null) ? 0 : (step + 1) % NUMBER_OF_STEPS;

			return {
				...action,
				newStep,
			};
		}
		case ACTION_PLAY: {
			const metaValue = game.getMetaValue(action.card, action.generatedBy);
			const metaCard = Array.isArray(metaValue) ? metaValue[0] : metaValue;

			const cardPlayed = action.payload ? action.payload.card : metaCard;

			return {
				...action,
				payload: {
					...action.payload,
					card: convertCard(cardPlayed),
				}
			};
		}
		case ACTION_ATTACK: {
			const convertedAction = {
				type: action.type,
				source: action.source.id,
				target: action.target.id,
				player: action.player,
			};

			if (action.additionalAttackers) {
				convertedAction.additionalAttackers = action.additionalAttackers.map(card => card.id);
			}
			return convertedAction;
		}
		case ACTION_ENTER_PROMPT: {
			const actionSource = game.getMetaValue(action.source, action.generatedBy);
			if (action.source) {
				action.source = convertCard(actionSource);
			}

			if (action.message && action.generatedBy) {
				const metaData = game.getSpellMetadata(action.generatedBy);
				action.message = templateMessage(action.message, metaData);
			}

			switch(action.promptType) {
				case PROMPT_TYPE_NUMBER: {
					action.min = game.getMetaValue(action.min, action.generatedBy);
					action.max = game.getMetaValue(action.max, action.generatedBy);

					break;
				}
				case PROMPT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES: {
					action.amount = game.getMetaValue(action.amount, action.generatedBy);

					break;
				}
				case PROMPT_TYPE_REARRANGE_ENERGY_ON_CREATURES: {
					action.amount = game.getMetaValue(action.amount, action.generatedBy);

					break;
				}
				case PROMPT_TYPE_CHOOSE_UP_TO_N_CARDS_FROM_ZONE: {
					const restrictions = action.restrictions || (action.restriction ? [
						{
							type: game.getMetaValue(action.restriction, action.generatedBy),
							value: game.getMetaValue(action.restrictionValue, action.generatedBy),
						},
					] : null);

					const zone = game.getMetaValue(action.zone, action.generatedBy);
					const zoneOwner = game.getMetaValue(action.zoneOwner, action.generatedBy);
					const numberOfCards = game.getMetaValue(action.numberOfCards, action.generatedBy);
					const cardFilter = game.makeCardFilter(restrictions || []);
					const zoneContent = game.getZone(zone, zoneOwner).cards;
					const cards = restrictions ? zoneContent.filter(cardFilter) : zoneContent;

					return {
						type: ACTION_ENTER_PROMPT,
						promptType: PROMPT_TYPE_CHOOSE_UP_TO_N_CARDS_FROM_ZONE,
						player: action.player,
						zone,
						restrictions,
						cards: cards.map(convertCard),
						zoneOwner,
						numberOfCards,
					};
				}
				case PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE: {
					const restrictions = action.restrictions || (action.restriction ? [
						{
							type: game.getMetaValue(action.restriction, action.generatedBy),
							value: game.getMetaValue(action.restrictionValue, action.generatedBy),
						},
					] : null);

					const zone = game.getMetaValue(action.zone, action.generatedBy);
					const zoneOwner = game.getMetaValue(action.zoneOwner, action.generatedBy);
					const numberOfCards = game.getMetaValue(action.numberOfCards, action.generatedBy);
					const cardFilter = game.makeCardFilter(restrictions || []);
					const zoneContent = game.getZone(zone, zoneOwner).cards;
					const cards = restrictions ? zoneContent.filter(cardFilter) : zoneContent;

					return {
						type: ACTION_ENTER_PROMPT,
						promptType: PROMPT_TYPE_CHOOSE_N_CARDS_FROM_ZONE,
						player: action.player,
						zone,
						restrictions,
						cards: cards.map(convertCard),
						zoneOwner,
						numberOfCards,
					};
				}
				case PROMPT_TYPE_REARRANGE_CARDS_OF_ZONE: {
					const zone = game.getMetaValue(action.promptParams.zone, action.generatedBy);
					const zoneOwner = game.getMetaValue(action.promptParams.zoneOwner, action.generatedBy);
					const numberOfCards = game.getMetaValue(action.promptParams.numberOfCards, action.generatedBy);
					const zoneContent = game.getZone(zone, zoneOwner).cards;
					const cards = zoneContent.slice(0, parseInt(numberOfCards, 10));

					return {
						type: ACTION_ENTER_PROMPT,
						promptType: PROMPT_TYPE_REARRANGE_CARDS_OF_ZONE,
						player: action.player,
						zone,
						cards: cards.map(convertCard),
						zoneOwner,
						numberOfCards,
					};
				}
			}
			break;
		}
		case ACTION_POWER: {
			const actionSource = game.getMetaValue(action.source, action.generatedBy);
			return {
				...action,
				source: convertCard(actionSource),
				power: action.power.name,
			};
		}
		case ACTION_EFFECT: {
			switch (action.effectType) {
				case EFFECT_TYPE_CARD_MOVED_BETWEEN_ZONES: {
					const sourceCardOwner = action.sourceCard.owner;
					const destinationCardOwner = action.destinationCard.owner;
					// we hide the card if the source or destination zone is
					// marked as hidden and zone owner is different from player we're doing conversion for 
					return {
						type: action.type,
						effectType: action.effectType,
						sourceCard: hideIfNecessary(
							convertCard(action.sourceCard),
							action.sourceZone,
							overrideHiding ? false : sourceCardOwner !== playerId
						),
						sourceZone: action.sourceZone,
						destinationCard: hideIfNecessary(
							convertCard(action.destinationCard),
							action.destinationZone,
							overrideHiding ? false : destinationCardOwner !== playerId
						),
						destinationZone: action.destinationZone,
						convertedFor: playerId,
						destOwner: destinationCardOwner,
					};
				}
				case EFFECT_TYPE_REARRANGE_CARDS_OF_ZONE: {
					const cards = (typeof action.cards == 'string') ?
						game.getMetaValue(action.cards, action.generatedBy) :
						action.cards;

					const zone = game.getMetaValue(action.zone, action.generatedBy);
					const zoneOwner = game.getMetaValue(action.zoneOwner, action.generatedBy);
					return {
						...action,
						cards,
						zone,
						zoneOwner,
					};
				}
				case EFFECT_TYPE_PAYING_ENERGY_FOR_POWER: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					return {
						...action,
						target: convertCardMinimal(target),
						amount,
					};
				}
				case EFFECT_TYPE_MAGI_IS_DEFEATED: {
					return {
						...action,
						target: convertCard(action.target),
					};
				}
				case EFFECT_TYPE_REARRANGE_ENERGY_ON_CREATURES: {
					const energyOnCreatures = game.getMetaValue(action.energyOnCreatures, action.generatedBy) || {};
					return {
						...action,
						source: convertCard(action.source),
						energyOnCreatures,
					};
				}
				case EFFECT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES: {
					const energyOnCreatures = game.getMetaValue(action.energyOnCreatures, action.generatedBy) || {};
					return {
						...action,
						source: convertCard(action.source),
						energyOnCreatures,
					};
				}
				case EFFECT_TYPE_PAYING_ENERGY_FOR_CREATURE: {
					const fromCard = (typeof action.from == 'string') ?
						game.getMetaValue(action.from, action.generatedBy) :
						action.from;
					const from = (fromCard.length) ? fromCard[0] : fromCard;

					return {
						...action,
						from: convertCardMinimal(from),
					};
				}
				case EFFECT_TYPE_FORBID_ATTACK_TO_CREATURE: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					return {
						...action,
						target: convertCard(targetCard),
					};
				}
				case EFFECT_TYPE_PAYING_ENERGY_FOR_SPELL: {
					const fromCard = (typeof action.from == 'string') ?
						game.getMetaValue(action.from, action.generatedBy) :
						action.from;
					const from = (fromCard.length) ? fromCard[0] : fromCard;

					return {
						...action,
						from: convertCardMinimal(from),
					};
				}
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_MAGI: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					return {
						...action,
						target: convertCard(target),
						amount,
					};
				}
				case EFFECT_TYPE_ATTACK: {
					return {
						...action,
						source: action.source.id,
						target: action.target.id,
						additionalAttackers: action.additionalAttackers.map(card => card.id),
						generatedBy: action.generatedBy,
						player: action.player,
					};
				}
				case EFFECT_TYPE_CREATURE_ATTACKS: {
					return {
						...action,
						source: convertCardMinimal(action.source),
						target: convertCardMinimal(action.target),
						sourceAtStart: convertCardMinimal(action.sourceAtStart),
						targetAtStart: convertCardMinimal(action.targetAtStart),
					};
				}
				case EFFECT_TYPE_PLAY_CREATURE: {
					return {
						...action,
						card: convertCard(action.card),
					};
				}
				case EFFECT_TYPE_MOVE_CARDS_BETWEEN_ZONES: {
					const targetCards = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					return {
						...action,
						target: (targetCards instanceof Array) ? targetCards.map(convertCardMinimal) : convertCardMinimal(targetCards),
					};
				}
				case EFFECT_TYPE_MOVE_CARD_BETWEEN_ZONES: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					return {
						...action,
						target: convertCardMinimal(targetCard),
					};
				}
				case EFFECT_TYPE_MOVE_ENERGY: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const target = (targetCard.length) ? targetCard[0] : targetCard;

					const sourceCard = (typeof action.source == 'string') ?
						game.getMetaValue(action.source, action.generatedBy) :
						action.source;

					const source = (sourceCard.length) ? sourceCard[0] : sourceCard;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					return {
						...action,
						target: convertCard(target),
						source: convertCard(source),
						amount,
					};
				}
				case EFFECT_TYPE_DISCARD_CREATURE_FROM_PLAY: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					return {
						...action,
						target: convertCard(target),
					};
				}
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard instanceof Array) ? targetCard.map(convertCardMinimal) : convertCardMinimal(targetCard);

					return {
						...action,
						target,
						source: action.source ? convertCardMinimal(action.source) : action.source,
						amount,
					};
				}
				case EFFECT_TYPE_REMOVE_ENERGY_FROM_CREATURE: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard instanceof Array) ? targetCard.map(convertCardMinimal) : convertCardMinimal(targetCard);

					return {
						...action,
						target,
						source: action.source ? convertCardMinimal(action.source) : action.source,
						amount,
					};
				}
				case EFFECT_TYPE_REMOVE_ENERGY_FROM_MAGI: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;
                    
					const target = (targetCard instanceof Array) ? targetCard.map(convertCardMinimal) : convertCardMinimal(targetCard);

					return {
						...action,
						target,
						source: action.source ? convertCardMinimal(action.source) : action.source,
						amount,
					};
				}
				case EFFECT_TYPE_ADD_ENERGY_TO_CREATURE: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					if (!(targetCard instanceof Array) && (!('_card' in targetCard) || !targetCard._card)) {
						throw new Error('Card action without the card!');
					}

					const target = (targetCard instanceof Array) ? targetCard.map(convertCardMinimal) : convertCardMinimal(targetCard);

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					return {
						...action,
						target,
						source: action.source ? convertCardMinimal(action.source) : false,
						amount,
					};
				}
				case EFFECT_TYPE_ADD_ENERGY_TO_MAGI: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;
                    
					const target = (targetCard.length) ? targetCard[0] : targetCard;

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					return {
						...action,
						target: convertCardMinimal(target),
						amount,
					};
				}
				case EFFECT_TYPE_DISCARD_RESHUFFLED: {
					return {
						...action,
					};
				}
				// Log size optimization
				case EFFECT_TYPE_DEAL_DAMAGE: {
					return {
						type: action.type,
						effectType: action.effectType,
						source: action.source.id,
						target: action.target.id,
						amount: action.amount,
						generatedBy: action.generatedBy,
					};
				}
				case EFFECT_TYPE_DAMAGE_STEP: {
					return {
						type: action.type,
						effectType: action.effectType,
						source: action.source.id,
						target: action.target.id,
						packHuntAttack: action.packHuntAttack,
						generatedBy: action.generatedBy,
					};
				}
				case EFFECT_TYPE_ATTACKER_DEALS_DAMAGE: {
					return {
						type: action.type,
						effectType: action.effectType,
						source: action.source.id,
						target: action.target.id,
						amount: action.amount,
						generatedBy: action.generatedBy,
					};
				}
				case EFFECT_TYPE_DEFENDER_DEALS_DAMAGE: {
					return {
						type: action.type,
						effectType: action.effectType,
						source: action.source.id,
						target: action.target.id,
						amount: action.amount,
						generatedBy: action.generatedBy,
					};
				}
				case EFFECT_TYPE_DISCARD_ENERGY_FROM_CREATURE_OR_MAGI: {
					return {
						type: action.type,
						effectType: action.effectType,
						source: action.source.id,
						target: action.target.id,
						attack: action.attack,
						spell: action.spell,
						relic: action.relic,
						amount: action.amount,
						generatedBy: action.generatedBy,
					};
				}
				case EFFECT_TYPE_BEFORE_DAMAGE: {
					return {
						type: action.type,
						effectType: action.effectType,
						source: action.source.id,
						target: action.target.id,
						generatedBy: action.generatedBy,
					};
				}
				case EFFECT_TYPE_CREATURE_DEFEATS_CREATURE: {
					return {
						type: action.type,
						effectType: action.effectType,
						source: action.source.id,
						target: action.target.id,
						attack: action.attack,
						generatedBy: action.generatedBy,
					};
				}
				case EFFECT_TYPE_CREATURE_IS_DEFEATED: {
					return {
						type: action.type,
						effectType: action.effectType,
						target: action.target.id,
						generatedBy: action.generatedBy,
					};
				}
				case EFFECT_TYPE_RETURN_CREATURE_RETURNING_ENERGY: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;
                    
					const target = (targetCard instanceof Array) ? targetCard.map(convertCardMinimal) : convertCardMinimal(targetCard);

					const convertedAction = {
						type: action.type,
						effectType: action.effectType,
						target,
						power: action.power,
						generatedBy: action.generatedBy,
					};
					if (action.source) {
						convertedAction.source = convertCardMinimal(action.source);
					}
					return convertedAction;
				}
			}
		}
	}

	return action;
}

export default convertServerCommand;

import {
	ACTION_PASS,
	ACTION_PLAY,
	ACTION_ENTER_PROMPT,
	ACTION_EFFECT,
	ACTION_POWER,

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
	EFFECT_TYPE_CREATURE_ATTACKS,
	EFFECT_TYPE_MAGI_IS_DEFEATED,
	EFFECT_TYPE_FORBID_ATTACK_TO_CREATURE,
	EFFECT_TYPE_REARRANGE_ENERGY_ON_CREATURES,
	EFFECT_TYPE_DISTRIBUTE_ENERGY_ON_CREATURES,
	EFFECT_TYPE_PLAY_CREATURE,
	EFFECT_TYPE_DISCARD_RESHUFFLED,
	EFFECT_TYPE_REARRANGE_CARDS_OF_ZONE,
	EFFECT_TYPE_MOVE_CARD_BETWEEN_ZONES,

	ZONE_TYPE_DECK,
	ZONE_TYPE_MAGI_PILE,
	ZONE_TYPE_HAND,
	EFFECT_TYPE_MOVE_CARDS_BETWEEN_ZONES,
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
						target: convertCard(target),
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
						from: convertCard(from),
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
						from: convertCard(from),
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
				case EFFECT_TYPE_CREATURE_ATTACKS: {
					return {
						...action,
						source: convertCard(action.source),
						target: convertCard(action.target),
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
						target: (targetCards instanceof Array) ? targetCards.map(convertCard) : convertCard(targetCards),
					};
				}
				case EFFECT_TYPE_MOVE_CARD_BETWEEN_ZONES: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;

					return {
						...action,
						target: convertCard(targetCard),
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
                    
					const target = (targetCard.length) ? targetCard.map(convertCard) : convertCard(targetCard);

					return {
						...action,
						target,
						amount,
					};
				}
				case EFFECT_TYPE_ADD_ENERGY_TO_CREATURE: {
					const targetCard = (typeof action.target == 'string') ?
						game.getMetaValue(action.target, action.generatedBy) :
						action.target;
                    
					const target = (targetCard.length) ? targetCard.map(convertCard) : convertCard(targetCard);

					const amount = (typeof action.amount == 'string') ?
						parseInt(game.getMetaValue(action.amount, action.generatedBy), 10) :
						action.amount;

					return {
						...action,
						target,
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
						target: convertCard(target),
						amount,
					};
				}
				case EFFECT_TYPE_DISCARD_RESHUFFLED: {
					return {
						...action,
					};
				}
			}
		}
	}

	return action;
}

export default convertServerCommand;

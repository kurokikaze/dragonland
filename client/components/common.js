/* global window */
import { connect, useSelector } from 'react-redux';
import { byName } from 'moonlands/dist/cards';
import { clone } from '../../utils';
import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_MAGI,

	PROMPT_TYPE_RELIC,
	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,

	RESTRICTION_TYPE,
	RESTRICTION_ENERGY_LESS_THAN_STARTING,
	RESTRICTION_ENERGY_LESS_THAN,
	RESTRICTION_OWN_CREATURE,
	RESTRICTION_OPPONENT_CREATURE,
	RESTRICTION_REGION,
	RESTRICTION_CREATURE_TYPE,

	SELECTOR_OWN_CREATURES,
	SELECTOR_OWN_MAGI,
	SELECTOR_STATUS,
	SELECTOR_ID,
	SELECTOR_OWN_CREATURES_WITH_STATUS,
	SELECTOR_CREATURES_OF_PLAYER,

	CALCULATION_SET,
	CALCULATION_ADD,
	CALCULATION_SUBTRACT,
	CALCULATION_SUBTRACT_TO_MINIMUM_OF_ONE,
	CALCULATION_DOUBLE,
	CALCULATION_HALVE_ROUND_DOWN,
	CALCULATION_HALVE_ROUND_UP,
	CALCULATION_MIN,
	CALCULATION_MAX,
	
	PROPERTY_ID,
	PROPERTY_POWER_COST,
	PROPERTY_TYPE,
	PROPERTY_CREATURE_TYPES,
	PROPERTY_MAGI_NAME,
	PROPERTY_ENERGY_COUNT,
	PROPERTY_REGION,
	PROPERTY_CAN_BE_ATTACKED,
	PROPERTY_MAGI_STARTING_ENERGY,
	PROPERTY_STATUS_DEFEATED_CREATURE,
	PROPERTY_STATUS_WAS_ATTACKED,
	PROPERTY_ATTACKS_PER_TURN,
	PROPERTY_ENERGIZE,
	PROPERTY_CONTROLLER,
	PROPERTY_COST,
	PROPERTY_STATUS,
	PROPERTY_CAN_ATTACK_MAGI_DIRECTLY,
	PROPERTY_ABLE_TO_ATTACK,
	PROPERTY_ENERGY_LOSS_THRESHOLD,

	STATUS_BURROWED,
} from 'moonlands/dist/const';

import {getZoneContent} from '../selectors';

export const cardMatchesSelector = (card, selector, selectorParameter = null, source) => {
	switch (selector) {
		case SELECTOR_OWN_CREATURES: {
			return (card.card.type === TYPE_CREATURE && card.data.controller === source.data.controller);
		}
		case SELECTOR_OWN_MAGI: {
			return (card.card.type === TYPE_MAGI && card.data.controller === source.data.controller);
		}
		case SELECTOR_CREATURES_OF_PLAYER: {
			return (card.card.type === TYPE_CREATURE && card.data.controller === selectorParameter);
		}
		case SELECTOR_ID: {
			return (card.id === selectorParameter);
		}
		case SELECTOR_OWN_CREATURES_WITH_STATUS: {
			switch (selectorParameter) {
				case STATUS_BURROWED:
					return card.data.burrowed && card.data.controller === source.data.controller;
			}
			return false;
		}
		case SELECTOR_STATUS: {
			switch (selectorParameter) {
				case STATUS_BURROWED:
					return card.data.burrowed;
			}
			return false;
		}
	}
	return false;
};

export const performCalculation = (operator, operandOne, operandTwo) => {
	let result;
	switch (operator) {
		case CALCULATION_SET: {
			result = operandOne;
			break;
		}
		case CALCULATION_DOUBLE: {
			result = operandOne * 2;
			break;
		}
		case CALCULATION_ADD: {
			result = operandOne + operandTwo;
			break;
		}
		case CALCULATION_SUBTRACT: {
			result = operandOne - operandTwo;
			break;
		}
		case CALCULATION_SUBTRACT_TO_MINIMUM_OF_ONE: {
			result = Math.max(operandOne - operandTwo, 1);
			break;
		}
		case CALCULATION_HALVE_ROUND_DOWN: {
			result = Math.floor(operandOne / 2);
			break;
		}
		case CALCULATION_HALVE_ROUND_UP: {
			result = Math.ceil(operandOne / 2);
			break;
		}
		case CALCULATION_MIN: {
			result = Math.min(operandOne, operandTwo);
			break;
		}
		case CALCULATION_MAX: {
			result = Math.max(operandOne, operandTwo);
			break;
		}
	}

	return result;
};

export const transformCard = staticAbilityCards => cardData => {
	const card = cardData.card ? byName(cardData.card) : null;

	if (card) {
		const result = {
			...cardData,
			card,
			modifiedData: {...card.data},
		};

		staticAbilityCards.forEach(staticAbilityCard => {
			staticAbilityCard.card.data.staticAbilities.forEach(staticAbility => {
				if (cardMatchesSelector(result, staticAbility.selector, staticAbility.selectorParameter, staticAbilityCard)) {
					const modifierFunction = initialValue => {
						const {operator, operandOne} = staticAbility.modifier;
					
						// For specifying value to substract in modifiers as positive ("CALCULATION_SUBSTRACT, 1")
						if (operator === CALCULATION_SUBTRACT || operator === CALCULATION_SUBTRACT_TO_MINIMUM_OF_ONE) {
							return performCalculation(operator, initialValue, operandOne);
						} else {
							return performCalculation(operator, operandOne, initialValue);
						}
					};

					switch(staticAbility.property) {
						case PROPERTY_POWER_COST: {
							if ('powers' in result.modifiedData) {
								result.modifiedData.powers = result.modifiedData.powers.map(power => ({...power, cost: modifierFunction(power.cost)}));
							}
							break;
						}
						case PROPERTY_ATTACKS_PER_TURN: {
							result.modifiedData.attacksPerTurn = modifierFunction(result.modifiedData.attacksPerTurn);
							break;
						}
						case PROPERTY_ENERGIZE: {
							result.modifiedData.energize = modifierFunction(result.modifiedData.energize || 0);
							break;
						}
					}
				}
			});
		});
		return result;
	}

	return {
		...cardData,
		card,
	};
};

export const useCardData = (content) => {
	const staticAbilities = useSelector(state => state.staticAbilities) || [];

	return content.map(transformCard(staticAbilities));
};

export function mapCardDataFromProps(state, {id}) {
	const filter = card => card.id === id;
	const foundZone = Object.values(state.zones).find(zone => zone.find(filter));
	return {
		card: foundZone ? foundZone.find(filter) : null,
	};
}

export const withSingleCardData = connect(mapCardDataFromProps);

export const useZoneContent = zoneId => useSelector(getZoneContent(zoneId));

export const UNFILTERED_CREATURE_PROMPTS = [
	PROMPT_TYPE_SINGLE_CREATURE,
];

export const FILTERED_CREATURE_PROMPTS = [
	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI, 
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
];

export const UNFILTERED_RELIC_PROMPTS = [
	PROMPT_TYPE_RELIC,
];

const getRestrictionFilter = (restriction, value) => {
	switch(restriction) {
		case RESTRICTION_TYPE:
			return card => card.card.type === value;
		case RESTRICTION_REGION:
			return card => card.card.region === value;
		case RESTRICTION_CREATURE_TYPE:
			return card => (card.card.type === TYPE_CREATURE && card.card.name.split(' ').includes(value));
		case RESTRICTION_ENERGY_LESS_THAN:
			return card => (card.card.type === TYPE_CREATURE && card.data.energy < value);
		case RESTRICTION_ENERGY_LESS_THAN_STARTING:
			return card => (card.card.type === TYPE_CREATURE && card.data.energy < card.card.cost);
		case RESTRICTION_OWN_CREATURE:
			return card => (card.card.type === TYPE_CREATURE && (card.data.controller || card.owner) === window.playerId);
		case RESTRICTION_OPPONENT_CREATURE:
			return card => (card.card.type === TYPE_CREATURE && (card.data.controller || card.owner) !== window.playerId);
	}
};

export const getPromptFilter = (promptType, promptParams) => {
	switch (promptType) {
		case PROMPT_TYPE_RELIC:
			return card => card.card.type === TYPE_RELIC;
		case PROMPT_TYPE_SINGLE_CREATURE:
			return card => card.card.type === TYPE_CREATURE;
		case PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI:
			return card => (card.card.type === TYPE_MAGI || card.card.type === TYPE_CREATURE);
		case PROMPT_TYPE_OWN_SINGLE_CREATURE:
			return card => (card.data.controller || card.owner) === window.playerId && card.card.type === TYPE_CREATURE;
		case PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE:
			return card => card.id !== promptParams.source;
		case PROMPT_TYPE_SINGLE_CREATURE_FILTERED:
			if (promptParams) {
				if (promptParams.restrictions && promptParams.restrictions.length) {
					const checkers = promptParams.restrictions.map(({type, value}) => getRestrictionFilter(type, value));
					return card =>
						checkers.map(checker => checker(card)).every(a => a === true); // combine checkers
				} else {
					return getRestrictionFilter(promptParams.restriction, promptParams.restrictionValue);
				}
			} else {
				return () => true;
			}
		default:
			return () => true;
	}
};

const propertyLayers = {
	[PROPERTY_CONTROLLER]: 0,
	[PROPERTY_COST]: 1,
	[PROPERTY_ENERGIZE]: 2,
	[PROPERTY_STATUS]: 3,
	[PROPERTY_ATTACKS_PER_TURN]: 4,
	[PROPERTY_CAN_ATTACK_MAGI_DIRECTLY]: 5,
	[PROPERTY_ENERGY_LOSS_THRESHOLD]: 6,
	[PROPERTY_ABLE_TO_ATTACK]: 7,
};

function getByProperty(target, property, subProperty = null) {
	switch(property) {
		case PROPERTY_ID:
			return target.id;
		case PROPERTY_TYPE:
			return target.card.type;
		case PROPERTY_CREATURE_TYPES:
			return target.card.name.split(' ');
		case PROPERTY_MAGI_NAME:
			return target.card.name;
		case PROPERTY_CONTROLLER:
			return target.data.controller;
		case PROPERTY_ENERGY_COUNT:
			return target.data.energy;
		case PROPERTY_ATTACKS_PER_TURN:
			return target.card.data.attacksPerTurn;
		case PROPERTY_COST:
			return target.card.cost;
		case PROPERTY_ENERGIZE:
			return target.card.data.energize;
		case PROPERTY_REGION:
			return target.card.region;
		case PROPERTY_CAN_ATTACK_MAGI_DIRECTLY:
			return target.card.data.canAttackMagiDirectly;
		case PROPERTY_MAGI_STARTING_ENERGY:
			return target.card.data.startingEnergy;
		case PROPERTY_POWER_COST:
			return target.card.data.powers.find(({name}) => name === subProperty).cost;
		case PROPERTY_STATUS_WAS_ATTACKED:
			return target.data.wasAttacked || false;
		case PROPERTY_CAN_BE_ATTACKED:
			return target.card.data.canBeAttacked || true;
		case PROPERTY_STATUS_DEFEATED_CREATURE:
			return target.data.defeatedCreature || false;
		case PROPERTY_STATUS: {
			switch (subProperty) {
				case STATUS_BURROWED:
					return Object.hasOwnProperty.call(target.data, 'burrowed') ?
						target.data.burrowed :
						target.card.data.burrowed;
				default:
					return false;
			}
		}
		// These properties can only be modified by static abilities / continuous effects
		case PROPERTY_ENERGY_LOSS_THRESHOLD:
			return target.card.data.energyLossThreshold || 0;
		case PROPERTY_ABLE_TO_ATTACK:
			return target.card.data.ableToAttack || true;
	}
}

const gameStaticAbilities = [
	{
		name: 'Burrowed - Energy loss',
		text: 'Your burrowed creatures cannot lose more than 2 energy each turn',
		selector: SELECTOR_STATUS,
		selectorParameter: STATUS_BURROWED,
		property: PROPERTY_ENERGY_LOSS_THRESHOLD,
		modifier: {
			operator: CALCULATION_SET,
			operandOne: 2,
		},
	},
	{
		name: 'Burrowed - Ability to attack',
		text: 'Your burrowed creatures cannot attack',
		selector: SELECTOR_STATUS,
		selectorParameter: STATUS_BURROWED,
		property: PROPERTY_ABLE_TO_ATTACK,
		modifier: {
			operator: CALCULATION_SET,
			operandOne: false,
		},
	},
];


export const getCardDetails = state => {
	const baseCards = state.zones.inPlay;

	const allZonesCards = {
		inPlay: [...baseCards].map(card => ({ ...card, card: byName(card.card), originalCard: byName(card.card) })),
		activePlayerMagi: [...(state.zones.activePlayerMagi || [])].map(card => ({ ...card, card: byName(card.card), originalCard: byName(card.card) })),
		opponentActiveMagi: [...(state.zones.opponentActiveMagi || [])].map(card => ({ ...card, card: byName(card.card), originalCard: byName(card.card) })),
	};
	
	const continuousStaticAbilities = state.continuousEffects.map(effect => effect.staticAbilities).flat();
	const zoneAbilities = [...allZonesCards.inPlay, ...allZonesCards.activePlayerMagi, ...allZonesCards.opponentActiveMagi].reduce(
		(acc, cardInPlay) => cardInPlay.card.data.staticAbilities ? [
			...acc,
			...(cardInPlay.card.data.staticAbilities.map(a => ({...a, player: cardInPlay.data.controller})))
		] : acc,
		[],
	);

	const staticAbilities = [...gameStaticAbilities, ...zoneAbilities, ...continuousStaticAbilities].sort((a, b) => propertyLayers[a.property] - propertyLayers[b.property]);

	const resultingZones = staticAbilities.reduce((oldState, staticAbility) => {
		const {
			name,
			text,
			selector,
			selectorParameter,
			property,
			subProperty,
			modifier
		} = staticAbility;

		const { operator, operandOne } = modifier;

		const newState = clone(oldState);

		for (let cardId in newState.inPlay) {
			const currentCard = newState.inPlay[cardId];

			if (cardMatchesSelector(currentCard, selector, selectorParameter, { data: { controller: staticAbility.player || null }})) {

				if (!newState.inPlay[cardId].data.affectedBy) {
					newState.inPlay[cardId].data.affectedBy = [];
				}

				newState.inPlay[cardId].data.affectedBy = [...newState.inPlay[cardId].data.affectedBy, { name, text }];

				const initialValue = (property !== PROPERTY_POWER_COST) ? getByProperty(currentCard, property, subProperty) : null;
				switch (property) {
					case PROPERTY_ENERGIZE: {
						const resultValue = (operator === CALCULATION_SUBTRACT || operator === CALCULATION_SUBTRACT_TO_MINIMUM_OF_ONE) ?
							performCalculation(operator, initialValue, (typeof operandOne === 'number') ? operandOne : 0) :
							performCalculation(operator, (typeof operandOne === 'number') ? operandOne : 0, initialValue);

						newState.inPlay[cardId].card.data.energize = resultValue;
						break;
					}
					case PROPERTY_ATTACKS_PER_TURN: {
						const initialValue = getByProperty(currentCard, PROPERTY_ATTACKS_PER_TURN);
						const {operator, operandOne} = staticAbility.modifier;

						const resultValue = (operator === CALCULATION_SUBTRACT || operator === CALCULATION_SUBTRACT_TO_MINIMUM_OF_ONE) ?
							performCalculation(operator, initialValue, (typeof operandOne === 'number') ? operandOne : 0) :
							performCalculation(operator, (typeof operandOne === 'number') ? operandOne : 0, initialValue);

						newState.inPlay[cardId].card.data.attacksPerTurn = resultValue;
						break;
					}
					case PROPERTY_ENERGY_LOSS_THRESHOLD: {
						const initialValue = getByProperty(currentCard, PROPERTY_ENERGIZE);

						const resultValue = (operator === CALCULATION_SUBTRACT || operator === CALCULATION_SUBTRACT_TO_MINIMUM_OF_ONE) ?
							performCalculation(operator, initialValue, (typeof operandOne === 'number') ? operandOne : 0) :
							performCalculation(operator, (typeof operandOne === 'number') ? operandOne : 0, initialValue);

						newState.inPlay[cardId].card.data.energyLossThreshold = resultValue;
						break;
					}
					case PROPERTY_ABLE_TO_ATTACK: {
						const initialValue = getByProperty(currentCard, PROPERTY_ABLE_TO_ATTACK);
						const resultValue = (operator === CALCULATION_SET) ? operandOne : initialValue;

						newState.inPlay[cardId].card.data.ableToAttack = resultValue;
						break;
					}
					case PROPERTY_CAN_BE_ATTACKED: {
						const initialValue = getByProperty(currentCard, PROPERTY_CAN_BE_ATTACKED);
						const resultValue = (operator === CALCULATION_SET) ? operandOne : initialValue;

						newState.inPlay[cardId].card.data.canBeAttacked = resultValue;
						break;
					}
					case PROPERTY_CONTROLLER: {
						const initialValue = getByProperty(currentCard, PROPERTY_CONTROLLER);

						const resultValue = (operator === CALCULATION_SET) ? operandOne : initialValue;

						newState.inPlay[cardId].data.controller = resultValue;
						break;
					}
					case PROPERTY_STATUS: {
						const initialValue = getByProperty(currentCard, PROPERTY_STATUS, staticAbility.subProperty);

						const resultValue = (operator === CALCULATION_SET) ? operandOne : initialValue;

						switch (staticAbility.subProperty) {
							case STATUS_BURROWED: {
								newState.inPlay[cardId].data.burrowed = resultValue;
							}
						}
						break;
					}
					case PROPERTY_POWER_COST: {
						if (currentCard.card.data.powers) {
							for (let powerId in currentCard.card.data.powers) {
								const currentPower = currentCard.card.data.powers[powerId];
								const initialValue = getByProperty(currentCard, PROPERTY_POWER_COST, currentPower.name);
			
								const resultValue = (operator === CALCULATION_SUBTRACT || operator === CALCULATION_SUBTRACT_TO_MINIMUM_OF_ONE) ?
									performCalculation(operator, initialValue, (typeof operandOne === 'number') ? operandOne : 0) :
									performCalculation(operator, (typeof operandOne === 'number') ? operandOne : 0, initialValue);
								newState.inPlay[cardId].card.data.powers[powerId].cost = resultValue;
							}
						}
						break;
					}
				}
			}
		}

		return newState;
	}, allZonesCards);

	return resultingZones;
};

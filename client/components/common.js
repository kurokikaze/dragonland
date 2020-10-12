/* global window */
// import {mapProps} from 'recompose';
import {connect} from 'react-redux';
import {byName} from 'moonlands/src/cards.js';

import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_MAGI,

	PROMPT_TYPE_SINGLE_MAGI,
	PROMPT_TYPE_RELIC,
	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,

	RESTRICTION_TYPE,
	RESTRICTION_ENERGY_LESS_THAN_STARTING,
	RESTRICTION_OWN_CREATURE,
	RESTRICTION_OPPONENT_CREATURE,
	RESTRICTION_REGION,
	RESTRICTION_CREATURE_TYPE,

	SELECTOR_OWN_CREATURES,
	SELECTOR_OWN_MAGI,

	CALCULATION_SET,
	CALCULATION_ADD,
	CALCULATION_SUBTRACT,
	CALCULATION_SUBTRACT_TO_MINIMUM_OF_ONE,
	CALCULATION_DOUBLE,
	CALCULATION_HALVE_ROUND_DOWN,
	CALCULATION_HALVE_ROUND_UP,
	CALCULATION_MIN,
	CALCULATION_MAX,

	PROPERTY_ATTACKS_PER_TURN,
	PROPERTY_ENERGIZE,
} from 'moonlands/src/const.js';

import {zoneContent} from '../selectors';

const cardMatchesSelector = (card, selector, source) => {
	switch (selector) {
		case SELECTOR_OWN_CREATURES: {
			return (card.card.type === TYPE_CREATURE && card.data.controller === source.data.controller);
		}
		case SELECTOR_OWN_MAGI: {
			return (card.card.type === TYPE_MAGI && card.data.controller === source.data.controller);
		}
	}
	return false;
};

const performCalculation = (operator, operandOne, operandTwo) => {
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

export const cardDataTransformer = (state, props) => {
	const staticAbilityCards = state.staticAbilities || [];

	const transformCard = cardData => {
		const card = cardData.card ? byName(cardData.card) : null;

		if (card) {
			const result = {
				...cardData,
				card,
				modifiedData: {...card.data},
			};

			staticAbilityCards.forEach(staticAbilityCard => {
				staticAbilityCard.card.data.staticAbilities.forEach(staticAbility => {
					if (cardMatchesSelector(result, staticAbility.selector, staticAbilityCard)) {
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
							case PROPERTY_ATTACKS_PER_TURN: {
								result.modifiedData.attacksPerTurn = modifierFunction(result.modifiedData.attacksPerTurn);
								break;
							}
							case PROPERTY_ENERGIZE: {
								result.modifiedData.energize = modifierFunction(result.modifiedData.energize);
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

	return {
		...props,
		content: props.content.map(transformCard),
	};
};

export const withCardData = connect(cardDataTransformer);

export function mapCardDataFromProps(state, {id}) {
	const filter = card => card.id === id;
	const foundZone = Object.values(state.zones).find(zone => zone.find(filter));
	return {
		card: foundZone ? foundZone.find(filter) : null,
	};
}

export const withSingleCardData = connect(mapCardDataFromProps);

function mapStateToProps(state, {zoneId}) {
	return {
		content: zoneContent(zoneId, state),
	};
}

export const withZoneContent = connect(mapStateToProps);

export const UNFILTERED_CREATURE_PROMPTS = [
	PROMPT_TYPE_SINGLE_MAGI,
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
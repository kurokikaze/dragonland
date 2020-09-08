/* global window */
import {mapProps} from 'recompose';
import {connect} from 'react-redux';
import {byName} from 'moonlands/src/cards.js';

import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_MAGI,

	PROMPT_TYPE_SINGLE_MAGI,
	// PROMPT_TYPE_SINGLE_RELIC,
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
} from 'moonlands/src/const.js';

import {zoneContent} from '../selectors';

// @todo move to moonlands
const PROMPT_TYPE_SINGLE_RELIC = 'prompt/single_relic';

const propsTransformer = props => ({
	...props,
	content: props.content.map(cardData => ({
		...cardData,
		card: cardData.card ? byName(cardData.card) : null,
	})),
});

export const withCardData = mapProps(propsTransformer);

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
	PROMPT_TYPE_SINGLE_RELIC,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI, 
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
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
			return card => (card.card.type === TYPE_CREATURE && card.data.controller === window.playerId);
		case RESTRICTION_OPPONENT_CREATURE:
			return card => (card.card.type === TYPE_CREATURE && card.data.controller !== window.playerId);
	}
};

export const getPromptFilter = (promptType, promptParams) => {
	switch (promptType) {
		case PROMPT_TYPE_SINGLE_RELIC:
			return card => card.card.type === TYPE_RELIC;
		case PROMPT_TYPE_SINGLE_CREATURE:
			return card => card.card.type === TYPE_CREATURE;
		case PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI:
			return card => (card.card.type === TYPE_MAGI || card.card.type === TYPE_CREATURE);
		case PROMPT_TYPE_OWN_SINGLE_CREATURE:
			return card => card.data.controller === window.playerId && card.card.type === TYPE_CREATURE;
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
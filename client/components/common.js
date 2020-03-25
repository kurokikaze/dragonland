/* global window */
import {mapProps} from 'recompose';
import {connect} from 'react-redux';
import {byName} from 'moonlands/src/cards';

import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_MAGI,

	PROMPT_TYPE_SINGLE_MAGI,
	PROMPT_TYPE_SINGLE_RELIC,
	PROMPT_TYPE_SINGLE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_OWN_SINGLE_CREATURE,
	PROMPT_TYPE_ANY_CREATURE_EXCEPT_SOURCE,
	PROMPT_TYPE_SINGLE_CREATURE_FILTERED,
} from 'moonlands/src/const';

import {zoneContent} from '../selectors';

const propsTransformer = props => ({
	...props,
	content: props.content.map(cardData => ({
		...cardData,
		card: byName(cardData.card),
	})),
});

export const withCardData = mapProps(propsTransformer);

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
		default:
			return () => true;
	}
};
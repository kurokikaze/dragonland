/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import {
	TYPE_CREATURE,
	ACTION_RESOLVE_PROMPT,
} from 'moonlands/src/const';
import Card from './Card';
import {
	STEP_ATTACK,
} from '../const';
import {
	withCardData,
	withZoneContent,
	UNFILTERED_CREATURE_PROMPTS,
	FILTERED_CREATURE_PROMPTS,
	getPromptFilter,
} from './common';

function ZoneOpponentInPlay({
	name,
	content,
	active,
	cardClickHandler,
	isOnUnfilteredPrompt,
	isOnFilteredPrompt,
	promptFilter,
}) {
	return (
		<div className={`zone ${active ? 'zone-active' : ''}`} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<Card
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={cardClickHandler}
					isOnPrompt={isOnUnfilteredPrompt || (isOnFilteredPrompt && promptFilter(cardData))}
					droppable={active && cardData.card.type === TYPE_CREATURE}
					target={active && cardData.card.type === TYPE_CREATURE}
				/>,
			) : null}
		</div>
	);
}

const propsTransformer = props => ({
	...props,
	cardClickHandler: props.isOnCreaturePrompt ? cardId => {
		window.socket.emit('action', {
			type: ACTION_RESOLVE_PROMPT,
			target: cardId,
			generatedBy: props.promptGeneratedBy,
		});
	} : () => {},
	isOnUnfilteredPrompt: props.isOnCreaturePrompt && UNFILTERED_CREATURE_PROMPTS.includes(props.promptType),
	isOnFilteredPrompt: props.isOnCreaturePrompt && FILTERED_CREATURE_PROMPTS.includes(props.promptType),
	promptFilter: getPromptFilter(props.promptType, props.promptParams),
});

function mapStateToProps(state) {
	return {
		active: state.activePlayer == window.playerId && state.step === STEP_ATTACK,
		isOnCreaturePrompt: state.prompt,
		promptType: state.promptType,
		promptParams: state.promptParams,
		promptGeneratedBy: state.promptGeneratedBy,
	};
}

const enhance = compose(
	withZoneContent,
	connect(mapStateToProps),
	mapProps(propsTransformer),
	withCardData,
);

export default enhance(ZoneOpponentInPlay);

/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import cn from 'classnames';
import {
	TYPE_CREATURE,
	ACTION_RESOLVE_PROMPT,
} from 'moonlands/dist/const';
import Card from '../Card.jsx';
import {withAbilities} from '../CardAbilities.jsx';
import {
	STEP_ATTACK,
} from '../../const';
import {
	withCardData,
	withZoneContent,
	UNFILTERED_CREATURE_PROMPTS,
	FILTERED_CREATURE_PROMPTS,
	getPromptFilter,
} from '../common';

const CardWithAbilities = withAbilities(Card);

function ZoneOpponentInPlay({
	name,
	content,
	active,
	cardClickHandler,
	isOnUnfilteredPrompt,
	isOnFilteredPrompt,
	promptFilter,
	animation,
}) {
	return (
		<div className={cn('zone', 'zone-creatures', {'zone-active' : active})} data-zone-name={name} data-items={content.length}>
			{content.length ? content.map(cardData =>
				<CardWithAbilities
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					modifiedData={cardData.modifiedData}
					onClick={cardClickHandler}
					isOnPrompt={isOnUnfilteredPrompt || (isOnFilteredPrompt && promptFilter(cardData))}
					droppable={active && cardData.card.type === TYPE_CREATURE}
					target={active && cardData.card.type === TYPE_CREATURE}
					className={cn({'attackSource': animation && animation.source === cardData.id})}
					attacker={animation && animation.source === cardData.id}
				/>,
			) : null}
		</div>
	);
}

const propsTransformer = props => ({
	...props,
	cardClickHandler: props.isOnCreaturePrompt ? cardId => {
		window.socket.emit('clientAction', {
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
		animation: state.animation,
	};
}

const enhance = compose(
	withZoneContent,
	connect(mapStateToProps),
	mapProps(propsTransformer),
	withCardData,
);

export default enhance(ZoneOpponentInPlay);

/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import cn from 'classnames';
import {
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_SINGLE_MAGI,
	ACTION_RESOLVE_PROMPT,
} from 'moonlands/src/const';
import Card from './Card';
import {
	STEP_ATTACK,
} from '../const';
import {withCardData, withZoneContent} from './common';

function ZoneOpponentActiveMagi({ name, content, active, isOnMagiPrompt, cardClickHandler }) {
	return (
		<div className={cn('zone', {'zone-active': active})} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<Card
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={cardClickHandler}
					isOnPrompt={isOnMagiPrompt}
					droppable={active}
					target={active}
				/>,
			) : null}
		</div>
	);
}

const propsTransformer = props => ({
	...props,
	cardClickHandler: props.isOnMagiPrompt ? cardId => {
		window.socket.emit('action', {
			type: ACTION_RESOLVE_PROMPT,
			target: cardId,
			generatedBy: props.promptGeneratedBy,
		});
	} : () => {},
});

function mapStateToProps(state) {
	return {
		active: state.activePlayer == window.playerId && state.step === STEP_ATTACK,
		isOnMagiPrompt: state.prompt && [PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI, PROMPT_TYPE_SINGLE_MAGI].includes(state.promptType),
	};
}

const enhance = compose(
	withZoneContent,
	connect(mapStateToProps),
	mapProps(propsTransformer),
	withCardData,
);

export default enhance(ZoneOpponentActiveMagi);

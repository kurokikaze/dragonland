/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import cn from 'classnames';
import {
	ACTION_RESOLVE_PROMPT,
	ACTION_POWER,
	TYPE_CREATURE,
	PROMPT_TYPE_SINGLE_CREATURE,
} from 'moonlands/src/const';
import Card from './Card';
import {
	STEP_ATTACK,
	STEP_PRS_FIRST,
	STEP_PRS_SECOND,
} from '../const';
import {withCardData, withZoneContent} from './common';
import {withAbilities} from './CardAbilities';

const CardWithAbilities = withAbilities(Card);

function ZonePlayerInPlay({ name, content, active, cardClickHandler, abilityUseHandler, isOnCreaturePrompt, prsAvailable }) {
	const SelectedCard = prsAvailable ? CardWithAbilities : Card;
	return (
		<div className={cn('zone', {'zone-active': active})} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<SelectedCard
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={cardClickHandler}
					isOnPrompt={isOnCreaturePrompt}
					draggable={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.card.data.attacksPerTurn}
					available={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.card.data.attacksPerTurn}
					onAbilityUse={abilityUseHandler}
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
	abilityUseHandler: (id, powerName) => window.socket.emit('action', {
		type: ACTION_POWER,
		source: id,
		power: powerName,
	}),
});

function mapStateToProps(state) {
	return {
		prsAvailable: state.activePlayer == window.playerId && [STEP_PRS_FIRST, STEP_PRS_SECOND].includes(state.step),
		active: state.activePlayer == window.playerId && state.step === STEP_ATTACK,
		isOnCreaturePrompt: state.prompt && state.promptType === PROMPT_TYPE_SINGLE_CREATURE,
		promptGeneratedBy: state.promptGeneratedBy,
	};
}

const enhance = compose(
	withZoneContent,
	connect(mapStateToProps),
	mapProps(propsTransformer),
	withCardData,
);

export default enhance(ZonePlayerInPlay);

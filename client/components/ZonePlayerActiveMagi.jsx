/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import cn from 'classnames';
import {
	PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI,
	PROMPT_TYPE_SINGLE_MAGI,

	ACTION_RESOLVE_PROMPT,
	ACTION_POWER,
} from 'moonlands/src/const.js';
import Card from './Card.jsx';

import {isPRSAvailable} from '../selectors';
import {withAbilities} from './CardAbilities.jsx';
import {withCardData, withZoneContent} from './common';

const CardWithAbilities = withAbilities(Card);

function ZonePlayerActiveMagi({ name, content, active, isOnMagiPrompt, cardClickHandler, abilityUseHandler, animation }) {
	const SelectedCard = active ? CardWithAbilities : Card;
	return (
		<div className={cn('zone', 'zone-magi', {'zone-active': active})} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<SelectedCard
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={cardClickHandler}
					isOnPrompt={isOnMagiPrompt}
					target={active && cardData.card.data.powers && cardData.card.data.powers.length > cardData.data.actionsUsed.length}
					onAbilityUse={abilityUseHandler}
					className={cn({'attackTarget': animation && animation.target === cardData.id})}
				/>,
			) : null}
		</div>
	);
}

const propsTransformer = props => ({
	...props,
	cardClickHandler: props.isOnMagiPrompt ? cardId => {
		window.socket.emit('clientAction', {
			type: ACTION_RESOLVE_PROMPT,
			target: cardId,
			generatedBy: props.promptGeneratedBy,
		});
	} : () => {},
	abilityUseHandler: (id, powerName) => window.socket.emit('clientAction', {
		type: ACTION_POWER,
		source: id,
		power: powerName,
	}),
});

function mapStateToProps(state) {
	return {
		active: isPRSAvailable(state),
		isOnMagiPrompt: state.prompt && [PROMPT_TYPE_SINGLE_CREATURE_OR_MAGI, PROMPT_TYPE_SINGLE_MAGI].includes(state.promptType),
		animation: state.animation,
	};
}

const enhance = compose(
	withZoneContent,
	connect(mapStateToProps),
	mapProps(propsTransformer),
	withCardData,
);

export default enhance(ZonePlayerActiveMagi);

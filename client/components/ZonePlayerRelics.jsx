/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import cn from 'classnames';
import {
	// ACTION_RESOLVE_PROMPT,
	ACTION_POWER,
	TYPE_CREATURE,
} from 'moonlands/src/const.js';
import Card from './Card.jsx';
// import {
// 	STEP_ATTACK,
// } from '../const';
import {isPRSAvailable} from '../selectors';
import {
	withCardData, 
	withZoneContent,
} from './common.js';
import {withAbilities} from './CardAbilities.jsx';
import {withView} from './CardView.jsx';

const CardWithAbilities = withAbilities(Card);
const CardWithView = withView(Card);

function ZonePlayerRelics({
	name,
	zoneId,
	content, 
	active, 
	cardClickHandler, 
	abilityUseHandler, 
	prsAvailable,
}) {
	const SelectedCard = prsAvailable ? CardWithAbilities : CardWithView;
	return (
		<div className={cn('zone', 'zone-relics', zoneId, {'zone-active' : active})} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<SelectedCard
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={cardClickHandler}
					isOnPrompt={false}
					available={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.card.data.attacksPerTurn}
					onAbilityUse={abilityUseHandler}
					useLocket={true}
				/>,
			) : null}
		</div>
	);
}

const propsTransformer = props => ({
	...props,
	// cardClickHandler: props.isOnCreaturePrompt ? cardId => {
	// 	window.socket.emit('clientAction', {
	// 		type: ACTION_RESOLVE_PROMPT,
	// 		target: cardId,
	// 		generatedBy: props.promptGeneratedBy,
	// 	});
	// } : () => {},
	abilityUseHandler: (id, powerName) => window.socket.emit('clientAction', {
		type: ACTION_POWER,
		source: id,
		power: powerName,
	}),
	// isOnUnfilteredPrompt: props.isOnCreaturePrompt && UNFILTERED_CREATURE_PROMPTS.includes(props.promptType),
	// isOnFilteredPrompt:  props.isOnCreaturePrompt && FILTERED_CREATURE_PROMPTS.includes(props.promptType),
	// promptFilter: getPromptFilter(props.promptType, props.promptParams),
});

function mapStateToProps(state) {
	return {
		prsAvailable: isPRSAvailable(state),
		active: false,
		// isOnCreaturePrompt: state.prompt,
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

export default enhance(ZonePlayerRelics);

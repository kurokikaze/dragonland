/* global window */
import React, {useState} from 'react';
import {connect} from 'react-redux';
import {compose, mapProps} from 'recompose';
import cn from 'classnames';
import {
	ACTION_RESOLVE_PROMPT,
	ACTION_POWER,
	TYPE_CREATURE,
} from 'moonlands/src/const.js';
import Card from '../Card.jsx';
import {
	STEP_ATTACK,
} from '../../const';
import {isPRSAvailable} from '../../selectors';
import {
	withCardData, 
	withZoneContent,
	UNFILTERED_CREATURE_PROMPTS,
	FILTERED_CREATURE_PROMPTS,
	getPromptFilter,
} from '../common.js';
import {withAbilities} from '../CardAbilities.jsx';

import './style.css';

const CardWithAbilities = withAbilities(Card);

function ZonePlayerInPlay({
	name, 
	content = [], 
	active, 
	cardClickHandler, 
	abilityUseHandler, 
	isOnUnfilteredPrompt,
	isOnFilteredPrompt,
	promptFilter,
	prsAvailable,
	animation,
}) {
	const SelectedCard = CardWithAbilities;
	const hasPackHunters = content.some(cardData => cardData.card.data && cardData.card.data.canPackHunt);

	const [packs, setPacks] = useState([]);

	const onAddToPack = (newLeader, newHunter) => {
		console.log('Creating pack ', newLeader, newHunter);
		const pack = packs.find(p => p.leader === newLeader);
		if (pack) {
			setPacks(packs.map(({leader, hunters}) => leader === newLeader ? {leader, hunters: [...hunters, newHunter]} : {leader, hunters}));
		} else {
			setPacks([...packs, {leader: newLeader, hunters: [newHunter]}]);
		}
	};

	const onRemovePack = (leaderId) => {
		setPacks(packs.filter(({leader}) => leader !== leaderId));
	};

	return (
		<div className={cn('zone', 'zone-creatures', {'zone-active' : active})} data-zone-name={name}>
			{content.filter(({id}) => !packs.some(pack => pack.hunters.includes(id))).map(cardData =>
				<div key={cardData.id} className='packHolder'>
					<SelectedCard
						id={cardData.id}
						card={cardData.card}
						data={cardData.data}
						modifiedData={cardData.modifiedData}
						onClick={cardClickHandler}
						isOnPrompt={isOnUnfilteredPrompt || (isOnFilteredPrompt && promptFilter(cardData))}
						draggable={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.modifiedData.attacksPerTurn}
						target={active && hasPackHunters && cardData.data.attacked < cardData.modifiedData.attacksPerTurn}
						pack={packs.find(({leader}) => leader === cardData.id)}
						droppable={active && hasPackHunters}
						available={active && cardData.card.type === TYPE_CREATURE && cardData.data.attacked < cardData.modifiedData.attacksPerTurn}
						actionsAvailable={prsAvailable}
						onAbilityUse={abilityUseHandler}
						onPackHunt={onAddToPack}
						className={cn({'attackTarget': animation && animation.target === cardData.id})}
					/>
					{packs.some(({leader}) => leader === cardData.id) ? 
						<div className='packHuntCounter' onClick={() => onRemovePack(cardData.id)}>+ {packs.find(({leader}) => leader === cardData.id).hunters.length}</div>
						: null}
				</div>
			)}
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
	abilityUseHandler: (id, powerName) => window.socket.emit('clientAction', {
		type: ACTION_POWER,
		source: id,
		power: powerName,
	}),
	isOnUnfilteredPrompt: props.isOnCreaturePrompt && UNFILTERED_CREATURE_PROMPTS.includes(props.promptType),
	isOnFilteredPrompt:  props.isOnCreaturePrompt && FILTERED_CREATURE_PROMPTS.includes(props.promptType),
	promptFilter: getPromptFilter(props.promptType, props.promptParams),
});

function mapStateToProps(state) {
	return {
		prsAvailable: isPRSAvailable(state),
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

export default enhance(ZonePlayerInPlay);

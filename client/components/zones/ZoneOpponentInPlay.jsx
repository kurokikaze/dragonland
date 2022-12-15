/* global window */
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {
	TYPE_CREATURE,
	ACTION_RESOLVE_PROMPT,
	PROMPT_TYPE_DISTRIBUTE_DAMAGE_ON_CREATURES,
} from 'moonlands/dist/const';
import Card from '../Card.jsx';
import {withAbilities} from '../CardAbilities.jsx';
import {
	STEP_ATTACK,
	CLIENT_ACTION,
} from '../../const';
import {
	getCardDetails,
	UNFILTERED_CREATURE_PROMPTS,
	FILTERED_CREATURE_PROMPTS,
	getPromptFilter,
} from '../common';
import {
	getCurrentStep,
	isOurTurn,
	getPromptGeneratedBy,
	isPromptActive,
	getPromptType,
	getPromptParams,
	getAnimation,
} from '../../selectors';
import {withEnergyManipulation} from '../CardEnergyManipulation.jsx';
import { useCallback } from 'react';

const CardWithAbilities = withAbilities(Card);
const CardWithEnergyManipulation = withEnergyManipulation(Card);

function ZoneOpponentInPlay({
	name,
}) {
	const rawContent = useSelector(getCardDetails);
	const content = rawContent.inPlay.filter(card => card.card.type === TYPE_CREATURE && card.data.controller !== window.playerId);
	
	const currentStep = useSelector(getCurrentStep);
	const ourTurn = useSelector(isOurTurn);
	const active = ourTurn && currentStep === STEP_ATTACK;
	const promptGeneratedBy = useSelector(getPromptGeneratedBy);
	const isOnCreaturePrompt = useSelector(isPromptActive);
	const promptType = useSelector(getPromptType);
	const promptParams = useSelector(getPromptParams);
	const promptFilter = useCallback(getPromptFilter(promptType, promptParams), [promptType, promptParams]);
	const isOnUnfilteredPrompt = isOnCreaturePrompt && UNFILTERED_CREATURE_PROMPTS.includes(promptType);
	const isOnFilteredPrompt = isOnCreaturePrompt && FILTERED_CREATURE_PROMPTS.includes(promptType);
	const animation = useSelector(getAnimation);

	const SelectedCard = (promptType === PROMPT_TYPE_DISTRIBUTE_DAMAGE_ON_CREATURES)
		? CardWithEnergyManipulation
		: CardWithAbilities;

	const cardClickHandler = isOnCreaturePrompt ? cardId => {
		window.socket.emit(CLIENT_ACTION, {
			type: ACTION_RESOLVE_PROMPT,
			target: cardId,
			generatedBy: promptGeneratedBy,
		});
	} : () => {};

	return (
		<div className={cn('zone', 'zone-creatures', {'zone-active' : active})} data-zone-name={name} data-items={content.length}>
			{content.length ? content.map(cardData =>
				<SelectedCard
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					modifiedData={cardData.card.data}
					onClick={cardClickHandler}
					isOnPrompt={isOnUnfilteredPrompt || (isOnFilteredPrompt && promptFilter(cardData))}
					droppable={active && cardData.card.type === TYPE_CREATURE}
					target={active && cardData.card.type === TYPE_CREATURE}
					className={cn({'attackSource': animation && animation.source === cardData.id, 'additionalAttacker': animation && animation.additionalAttacker === cardData.id})}
					attacker={animation && animation.source === cardData.id}
				/>,
			) : null}
		</div>
	);
}

export default ZoneOpponentInPlay;

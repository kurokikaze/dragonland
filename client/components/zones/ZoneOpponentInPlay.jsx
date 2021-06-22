/* global window */
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {
	TYPE_CREATURE,
	ACTION_RESOLVE_PROMPT,
} from 'moonlands/dist/const';
import Card from '../Card.jsx';
import {withAbilities} from '../CardAbilities.jsx';
import {
	STEP_ATTACK,
	CLIENT_ACTION,
} from '../../const';
import {
	useCardData,
	useZoneContent,
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
import { useCallback } from 'react';

const CardWithAbilities = withAbilities(Card);

function ZoneOpponentInPlay({
	zoneId,
	name,
}) {
	const rawContent = useZoneContent(zoneId);
	const content = useCardData(rawContent);
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

export default ZoneOpponentInPlay;

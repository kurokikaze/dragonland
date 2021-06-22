/* global window */
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {
	ACTION_POWER,
	ACTION_RESOLVE_PROMPT,
} from 'moonlands/dist/const';
import Card from '../Card.jsx';

import {
	isPRSAvailable,
	isPromptActive,
	getPromptGeneratedBy,
	getPromptType,
} from '../../selectors';
import {
	useCardData,
	useZoneContent,
	UNFILTERED_RELIC_PROMPTS,
} from '../common.js';
import {CLIENT_ACTION} from '../../const';
import {withAbilities} from '../CardAbilities.jsx';
import {withView} from '../CardView.jsx';

const CardWithAbilities = withAbilities(Card);
const CardWithView = withView(Card);

function ZonePlayerRelics({
	name,
	zoneId,
}) {
	const rawContent = useZoneContent(zoneId);
	const content = useCardData(rawContent);
	const isOnPrompt = useSelector(isPromptActive);
	const promptType = useSelector(getPromptType);
	const isOnUnfilteredPrompt = isOnPrompt && UNFILTERED_RELIC_PROMPTS.includes(promptType);
	const promptGeneratedBy = useSelector(getPromptGeneratedBy);
	const prsAvailable = useSelector(isPRSAvailable);

	const cardClickHandler = isOnPrompt ? cardId => {
		window.socket.emit(CLIENT_ACTION, {
			type: ACTION_RESOLVE_PROMPT,
			target: cardId,
			generatedBy: promptGeneratedBy,
		});
	} : () => {};

	const abilityUseHandler = (id, powerName) => window.socket.emit(CLIENT_ACTION, {
		type: ACTION_POWER,
		source: id,
		power: powerName,
	});

	return (
		<div className={cn('zone', 'zone-relics', zoneId)} data-zone-name={name}>
			{content.length ? content.map(cardData => {
				const SelectedCard = (prsAvailable && cardData.card.data.powers) ? CardWithAbilities : CardWithView;
				return <SelectedCard
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={cardClickHandler}
					isOnPrompt={isOnUnfilteredPrompt}
					actionsAvailable={prsAvailable}
					onAbilityUse={abilityUseHandler}
					useLocket={true}
				/>;
			}) : null}
		</div>
	);
}

export default ZonePlayerRelics;

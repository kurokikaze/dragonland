/* global window */
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {
	ACTION_RESOLVE_PROMPT,
	TYPE_CREATURE,
	PROMPT_TYPE_MAGI_WITHOUT_CREATURES,
} from 'moonlands/dist/const';
import {byName} from 'moonlands/dist/cards';
import Card from '../Card.jsx';
import {withAbilities} from '../CardAbilities.jsx';
import {
	STEP_ATTACK,
	CLIENT_ACTION,
} from '../../const';
import {useCardData, useZoneContent} from '../common';
import {isOurTurn, getCurrentStep, getPromptGeneratedBy, getIsOnMagiPrompt} from '../../selectors';

const CardWithAbilities = withAbilities(Card);

const opponentHasCreatures = state => state.zones.opponentInPlay.some(card => byName(card.card).type === TYPE_CREATURE);

const isOnFilteredMagiPrompt = (state) => {
	const isOnMWCPrompt = state.prompt && state.promptType === PROMPT_TYPE_MAGI_WITHOUT_CREATURES;
	return isOnMWCPrompt && !opponentHasCreatures(state);
};

function ZoneOpponentActiveMagi({ name, zoneId }) {
	const rawContent = useZoneContent(zoneId);
	const content = useCardData(rawContent);
	const currentStep = useSelector(getCurrentStep);
	const ourTurn = useSelector(isOurTurn);
	const active = ourTurn && currentStep === STEP_ATTACK;
	const guarded = useSelector(opponentHasCreatures);
	const promptGeneratedBy = useSelector(getPromptGeneratedBy);
	const isOnMagiPrompt = useSelector(getIsOnMagiPrompt);
	const onMWCPrompt = useSelector(isOnFilteredMagiPrompt);

	const cardClickHandler = (isOnMagiPrompt || onMWCPrompt) ? cardId => {
		window.socket.emit(CLIENT_ACTION, {
			type: ACTION_RESOLVE_PROMPT,
			target: cardId,
			generatedBy: promptGeneratedBy,
		});
	} : () => {};

	return (
		<div className={cn('zone', 'zone-magi', {'zone-active': active})} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<CardWithAbilities
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					modifiedData={cardData.modifiedData}
					data={cardData.data}
					onClick={cardClickHandler}
					isOnPrompt={isOnMagiPrompt || onMWCPrompt}
					droppable={active}
					target={active}
					guarded={guarded}
				/>,
			) : null}
		</div>
	);
}

export default ZoneOpponentActiveMagi;

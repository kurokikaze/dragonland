/* global window */
import {useCallback} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {
	ACTION_RESOLVE_PROMPT,
	ACTION_POWER,
} from 'moonlands/dist/const';
import Card from '../Card.jsx';
import {CLIENT_ACTION} from '../../const';
import {isPRSAvailable, getIsOnMagiPrompt, getAnimation, getPromptGeneratedBy} from '../../selectors';
import {withAbilities} from '../CardAbilities.jsx';
import {useZoneContent, useCardData} from '../common';

const CardWithAbilities = withAbilities(Card);

function ZonePlayerActiveMagi({ name, zoneId }) {
	const rawContent = useZoneContent(zoneId);
	const content = useCardData(rawContent);
	const active = useSelector(isPRSAvailable);
	const isOnMagiPrompt = useSelector(getIsOnMagiPrompt);
	const promptGeneratedBy = useSelector(getPromptGeneratedBy);
	const animation = useSelector(getAnimation);

	const cardClickHandler = isOnMagiPrompt ? cardId => {
		window.socket.emit(CLIENT_ACTION, {
			type: ACTION_RESOLVE_PROMPT,
			target: cardId,
			generatedBy: promptGeneratedBy,
		});
	} : () => {};

	const abilityUseHandler = useCallback((id, powerName) => window.socket.emit(CLIENT_ACTION, {
		type: ACTION_POWER,
		source: id,
		power: powerName,
	}), []);

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
					isOnPrompt={isOnMagiPrompt}
					target={active && cardData.card.data.powers && cardData.card.data.powers.length > cardData.data.actionsUsed.length}
					onAbilityUse={abilityUseHandler}
					actionsAvailable={active}
					className={cn({'attackTarget': animation && animation.target === cardData.id})}
				/>,
			) : null}
		</div>
	);
}

export default ZonePlayerActiveMagi;

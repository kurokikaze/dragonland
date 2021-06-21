import {useSelector} from 'react-redux';
import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_SPELL,
} from 'moonlands/src/const.ts';
import {cards} from 'moonlands/src/cards.ts';
import Card from '../Card.jsx';
import {getMagiEnergy, getCurrentStep, isOurTurn} from '../../selectors';
import {
	STEP_CREATURES,
	STEP_PRS_FIRST,
	STEP_PRS_SECOND,
} from '../../const';
import {useCardData, useZoneContent} from '../common';

import {withView} from '../CardView.jsx';

const canCast = (cardType, cardCost, magiEnergy, currentStep, relics, cardName) => 
	(cardCost <= magiEnergy) && (
		(cardType == TYPE_CREATURE && currentStep == STEP_CREATURES) ||
		(cardType == TYPE_SPELL && [STEP_PRS_FIRST, STEP_PRS_SECOND].includes(currentStep)) ||
		(cardType == TYPE_RELIC && [STEP_PRS_FIRST, STEP_PRS_SECOND].includes(currentStep) && !relics.includes(cardName))
	);

const relicsHash = cards
	.filter(card => card.type === TYPE_RELIC)
	.map(card => card.name)
	.reduce((acc, cardName) => ({...acc, [cardName]: true}), {});

const CardWithView = withView(Card);

const getRelics = state => state.zones.playerInPlay.filter(cardData => relicsHash[cardData.card]).map(cardData => cardData.card);

function ZoneHand({ name, zoneId, onCardClick }) {
	const rawContent = useZoneContent(zoneId);
	const content = useCardData(rawContent);
	const currentStep = useSelector(getCurrentStep);
	const ourTurn = useSelector(isOurTurn);
	const relics = useSelector(getRelics);
	const magiEnergy = useSelector(getMagiEnergy);

	return (
		<div className={`zone ${ourTurn ? 'zone-active' : ''}`} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<CardWithView
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={onCardClick}
					available={ourTurn && cardData.card && canCast(cardData.card.type, cardData.card.cost, magiEnergy, currentStep, relics, cardData.card.name)}
				/>,
			) : null}
		</div>
	);
}

export default ZoneHand;

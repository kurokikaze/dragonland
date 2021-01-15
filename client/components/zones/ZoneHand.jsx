/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_SPELL,
} from 'moonlands/dist/const';
import {cards} from 'moonlands/dist/cards';
import Card from '../Card.jsx';
import {getMagiEnergy} from '../../selectors';
import {
	STEP_CREATURES,
	STEP_PRS_FIRST,
	STEP_PRS_SECOND,
} from '../../const';
import {withCardData, withZoneContent} from '../common';

import {withView} from '../CardView.jsx';

const canCast = (cardType, cardCost, magiEnergy, currentStep, relics, cardName) => 
	(cardCost <= magiEnergy) && (
		(cardType == TYPE_CREATURE && currentStep == STEP_CREATURES) ||
		(cardType == TYPE_SPELL && [STEP_PRS_FIRST, STEP_PRS_SECOND].includes(currentStep)) ||
		(cardType == TYPE_RELIC && [STEP_PRS_FIRST, STEP_PRS_SECOND].includes(currentStep) && !relics.includes(cardName))
	);

const relicsHash = cards
	.filter(card => card.type === 'types/relic')
	.map(card => card.name)
	.reduce((acc, cardName) => ({...acc, [cardName]: true}), {});

const CardWithView = withView(Card);

function ZoneHand({ name, content, onCardClick, active, magiEnergy, currentStep, relics }) {
	return (
		<div className={`zone ${active ? 'zone-active' : ''}`} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<CardWithView
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={onCardClick}
					available={active && cardData.card && canCast(cardData.card.type, cardData.card.cost, magiEnergy, currentStep, relics, cardData.card.name)}
				/>,
			) : null}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		currentStep: state.step,
		magiEnergy: getMagiEnergy(state),
		active: state.activePlayer == window.playerId,
		relics: state.zones.playerInPlay.filter(cardData => relicsHash[cardData.card]).map(cardData => cardData.card),
	};
}

const enhance = compose(
	withZoneContent,
	connect(mapStateToProps),
	withCardData,
);

export default enhance(ZoneHand);

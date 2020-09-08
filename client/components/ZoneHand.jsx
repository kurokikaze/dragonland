/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {
	TYPE_CREATURE,
	TYPE_RELIC,
	TYPE_SPELL,
} from 'moonlands/src/const.js';
import Card from './Card.jsx';
import {getMagiEnergy} from '../selectors';
import {
	STEP_CREATURES,
	STEP_PRS_FIRST,
	STEP_PRS_SECOND,
} from '../const';
import {withCardData, withZoneContent} from './common';
import {withView} from './CardView.jsx';

const canCast = (cardType, cardCost, magiEnergy, currentStep) => 
	(cardCost <= magiEnergy) && (
		(cardType == TYPE_CREATURE && currentStep == STEP_CREATURES) ||
         ([TYPE_RELIC, TYPE_SPELL].includes(cardType) && [STEP_PRS_FIRST, STEP_PRS_SECOND].includes(currentStep))
	);

const CardWithView = withView(Card);

function ZoneHand({ name, content, onCardClick, active, magiEnergy, currentStep }) {
	return (
		<div className={`zone ${active ? 'zone-active' : ''}`} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<CardWithView
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={onCardClick}
					available={active && canCast(cardData.card.type, cardData.card.cost, magiEnergy, currentStep)}
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
	};
}

const enhance = compose(
	withZoneContent,
	connect(mapStateToProps),
	withCardData,
);

export default enhance(ZoneHand);

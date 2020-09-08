/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import Card from './Card.jsx';
import {withCardData, withZoneContent} from './common';

function Zone({ name, content, onCardClick, active }) {
	return (
		<div className={`zone ${active ? 'zone-active' : ''}`} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<Card
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={onCardClick}
					inActiveZone={active}
					onAbilityUse={() => null}
				/>,
			) : null}
		</div>
	);
}

function mapStateToProps(state, {name, activeStep}) {
	return {
		name,
		active: state.step === activeStep && state.activePlayer == window.playerId,
	};
}

const enhance = compose(
	withZoneContent,
	connect(mapStateToProps),
	withCardData,
);

export default enhance(Zone);

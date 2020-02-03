/* global window */
import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import cn from 'classnames';
// import {
// 	TYPE_CREATURE,
// 	TYPE_RELIC,
// 	TYPE_SPELL,
// } from 'moonlands/src/const';
import Card from './Card';
import {
	STEP_ATTACK,
} from '../const';
import {withCardData, withZoneContent} from './common';

function ZoneOpponentActiveMagi({ name, content, active }) {
	return (
		<div className={cn('zone', {'zone-active': active})} data-zone-name={name}>
			{content.length ? content.map(cardData =>
				<Card
					key={cardData.id}
					id={cardData.id}
					card={cardData.card}
					data={cardData.data}
					onClick={() => {}}
					droppable={active}
					target={active}
				/>,
			) : null}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		active: state.activePlayer == window.playerId && state.step === STEP_ATTACK,
	};
}

const enhance = compose(
	withZoneContent,
	connect(mapStateToProps),
	withCardData,
);

export default enhance(ZoneOpponentActiveMagi);
